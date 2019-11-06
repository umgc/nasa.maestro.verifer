'use strict';

var verbose = false;
const Duration = require('../model/Duration');

/**
 * Traverse forward or backward along timeline of tasks by role
 * @param {Task} activity
 * @param {string} role
 * @param {string} direction   'prev' or 'next'. Default is 'next'
 * @param {Function} validate  Function used to stop traverse if desired.
 *                             To stop on a Task that does not have Task.startVerified === true, do:
 *                             function(task) {
 *                                 return !task.startVerified;
 *                             }
 * @return {Task}  The Task object found
 */
function traverse(activity, role, direction, validate) {
	const dir = direction === 'prev' ? 'prevTask' : 'nextTask';
	if (!validate) {
		validate = function() {
			return true;
		};
	}
	let check = activity;
	while (check.actorRolesDict[role][dir] && validate(check.actorRolesDict[role][dir])) {
		check = check.actorRolesDict[role][dir];
	}
	return check;
}

function updateStartTimes(activity, stopAt = false) {

	// if traversing only to a point, stop at that point
	if (stopAt && stopAt === activity) {
		return;
	}

	for (const role in activity.actorRolesDict) {

		// previous activity for this role
		const rolePrevAct = activity.actorRolesDict[role].prevTask;

		// this role has an activity prior to this activity
		if (rolePrevAct) {

			// The previous activity does not have a start time. Since we're traversing forward in
			// the timeline, this could only happen if (a) our starting point wasn't at the start or
			// (b) we got to this activity by a chain of one role's activities and we've encountered
			// a new role for a first time, but this isn't that role's first activity. Also there
			// may be (c) where due to race conditions only one role has reached this activity yet.
			// To fix this issue, move backward along this role's timeline until the first activity
			// where the role has a non-null start time OR the role has no prior activities. Then
			// move forward in time updating start times until _this_ activity is reached again.
			if (rolePrevAct.actorRolesDict[role].startTime === null) {

				// traverse backwards until first task for this role, or when a task with
				// a startTime is found return the task without a startTime found prior to it.
				const moreUpdate = traverse(
					rolePrevAct, role, 'prev',
					function(task) {
						return task.actorRolesDict[role].startTime === null;
					}
				);

				// move forward in time, updating starts, until this activity is reached again
				updateStartTimes(moreUpdate, activity);
			}

			// guess that this activity's start time is the previous' start time plus duration. That
			// may not be true if this activity has multiple roles involved, and in order to keep
			// timelines synchronized the whole activity has to shift slightly later for some roles.
			activity.actorRolesDict[role].startTime = Duration.sum(
				rolePrevAct.actorRolesDict[role].startTime,
				rolePrevAct.actorRolesDict[role].duration
			);

		// this role does not have an activity prior to this activity
		} else {

			// assume an activity without a prior activity will start at time zero. That should not
			// necessarily be true. At least one role will start at zero, but if the sum of task
			// times between roles is not equal then it is possible one or more roles could
			// start at a time after zero. However, at present this case will still result in all
			// roles starting at zero.
			activity.actorRolesDict[role].startTime = new Duration();

		}

		activity.actorRolesDict[role].endTime = Duration.sum(
			activity.actorRolesDict[role].startTime,
			activity.actorRolesDict[role].duration
		);

	}

	// continue traversing forward in time to next activities
	for (const role in activity.actorRolesDict) {
		const nextTask = activity.actorRolesDict[role].nextTask;
		if (nextTask) {
			updateStartTimes(nextTask);
		}
	}

}

function clean(activity, stopAt = false) {

	// if traversing only to a point, stop at that point
	if (stopAt && stopAt === activity) {
		if (verbose) {
			console.log(`stop clean at ${activity.title}`);
		}
		return;
	}

	const roles = Object.keys(activity.actorRolesDict);
	const normalized = {};
	let maxNormalized = new Duration();

	const updated = {};
	const originalTimes = {}; // remove in production. only for debug.

	if (!activity.startVerified && roles.length > 1) {
		if (verbose) {
			console.log(`cleaning... ${activity.title}`);
		}

		// for debug only for now just to see what's happening.
		for (const role in activity.actorRolesDict) {
			originalTimes[role] = activity.actorRolesDict[role].startTime;
		}

		for (const role in activity.actorRolesDict) {
			// normalized start is a role's start time for an activity minus the offset. This makes
			// it possible to compare two or more roles' start times for the same activity.
			normalized[role] = Duration.subtract(
				activity.actorRolesDict[role].startTime,
				activity.actorRolesDict[role].duration.offset
			);

			if (normalized[role].getTotalSeconds() > maxNormalized.getTotalSeconds()) {
				maxNormalized = normalized[role];
			}
		}

		for (const role in normalized) {
			if (normalized[role].getTotalSeconds() !== maxNormalized.getTotalSeconds()) {

				// get new, de-normalized, start time
				activity.actorRolesDict[role].startTime = Duration.sum(
					maxNormalized,
					activity.actorRolesDict[role].duration.offset
				);

				activity.actorRolesDict[role].endTime = Duration.sum(
					activity.actorRolesDict[role].startTime,
					activity.actorRolesDict[role].duration
				);

				// mark this one updated
				updated[role] = true;
			}
		}

		for (const role in updated) {

			// remove in production, useful for dev.
			if (verbose) {
				console.log(`${activity.title} start time changed from ${originalTimes[role]} to ${activity.actorRolesDict[role].startTime} for role ${role}`);
			}

			// push the start time change forward to all following events
			if (activity.actorRolesDict[role].nextTask) {
				updateStartTimes(activity.actorRolesDict[role].nextTask);
			}

		}

	} else {
		let msg = `skipping clean on ${activity.title} because:`;
		if (activity.startVerified) {
			msg += ' start verified,';
		}
		if (roles.length < 2) {
			msg += ` ${roles.length} roles`;
		}
		if (verbose) {
			console.log(msg);
		}
	}

	// don't re-run this on any subsequent passes
	activity.startVerified = true;

	for (const role in activity.actorRolesDict) {

		// previous activity for this role
		const rolePrevAct = activity.actorRolesDict[role].prevTask;

		if (rolePrevAct && !rolePrevAct.startVerified) {
			// traverse backwards until first task for this role, or stop when a task with
			// startVerfied===true is found, and return the task found before that (with
			// startVerified===false/null)
			const moreClean = traverse(
				rolePrevAct, role, 'prev',
				function(task) {
					return !task.startVerified;
				}
			);

			// move forward in time, updating starts, until this activity is reached again
			clean(moreClean, activity);
		}
	}

	// continue cleaning activities
	for (const role in activity.actorRolesDict) {
		const nextTask = activity.actorRolesDict[role].nextTask;
		if (nextTask && !nextTask.startVerified) {
			clean(nextTask);
		}
	}

}

// method to collect all present roles, and point to their first and last task
function calcEndpoints(tasks) {
	const presentRoles = {};
	for (const task of tasks) {
		for (const role in task.actorRolesDict) {
			if (!presentRoles[role]) {
				presentRoles[role] = {
					first: traverse(task, role, 'prev'),
					last: traverse(task, role, 'next')
				};
			}
		}
	}
	return presentRoles;
}

// print something to the command line for now
function print(tasks) {
	for (const task in tasks) {
		const out = [tasks[task].title];

		for (const role in tasks[task].actorRolesDict) {
			const start = tasks[task].actorRolesDict[role].startTime.format('H:M');
			const duration = tasks[task].actorRolesDict[role].duration.format('H:M');
			const end = tasks[task].actorRolesDict[role].endTime.format('H:M');
			out.push(`  ${role}: ${start} + ${duration} = ${end}`);
		}

		console.log(out.join('\n'));
	}
}

module.exports = {
	updateStartTimes: updateStartTimes,
	clean: clean,
	print: print,
	verbose: function(v) {
		verbose = v;
	},
	calcEndpoints: calcEndpoints
};
