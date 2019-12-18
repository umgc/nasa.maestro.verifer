'use strict';

const Step = require('./Step');

function getRealActorId(taskRoles, actorIdGuess) {

	// "actorIdGuess" may be a proper actor ID like "EV1" or it may be a
	// placeholder "role" like "crewA". Procedures will then have to
	// pass in crewA === EV1 into the task, and it is the job of the
	// Task/ConcurrentStep/Step to
	// attribute those steps to EV1 instead of "crewA". Additionally
	// steps may include text like {{role:crewA}}. This is replaced
	// within Step.
	//
	// if taskRoles[actorIdGuess] found, then it means actorIdGuess isn't a
	// real actor and must be replaced with whomever the procedure
	// is passing in as an actor for the role.
	if (taskRoles[actorIdGuess]) {
		// console.log(taskRoles);
		// console.log(`actorRole ${actorIdGuess} is in taskRoles`);
		return taskRoles[actorIdGuess].actor;
	} else {
		return actorIdGuess;
	}
}

function createStep(stepYaml, actorIdOrIds, taskRoles) {
	const step = new Step();
	step.mapTaskRolesToActor(taskRoles);
	step.populateFromYaml(stepYaml);
	step.setActors(stepYaml.actor ? stepYaml.actor : actorIdOrIds);
	return step;
}

function getActorSteps(actorStepsYaml, taskRoles, actorIdOrIds) {

	// Initiate the array of steps for the actor
	const actorSteps = [];

	if (typeof actorStepsYaml === 'string') {
		actorSteps.push(createStep(actorStepsYaml, actorIdOrIds, taskRoles));

	} else if (Array.isArray(actorStepsYaml)) {

		for (var stepYaml of actorStepsYaml) {
			actorSteps.push(createStep(stepYaml, actorIdOrIds, taskRoles));
		}

	// Don't know how to process this
	} else {
		throw new Error(`Was expecting either steps or string for actor. Instead found: ${JSON.stringify(actorStepsYaml)}`);
	}

	return actorSteps;
}

function getActorInfo(actorIdGuess, taskRoles) {
	let idOrIds,
		id;
	// check for joint actors
	if (actorIdGuess.indexOf('+') !== -1) {

		// split the actors/roles on +, then replace things like "crewB" with "EV2" (if
		// EV2 is assigned to crewB role)
		idOrIds = actorIdGuess.split('+').map((str) => {
			return getRealActorId(taskRoles, str.trim());
		});

		// recreate ID by gluing back together
		id = idOrIds.join(' + ');

		idOrIds.unshift(id); // stick the composite back on the front. TODO necessary?
	} else {
		idOrIds = getRealActorId(taskRoles, actorIdGuess);
		id = idOrIds;
	}

	return { id: id, idOrIds: idOrIds };
}

module.exports = class ConcurrentStep {

	/**
	 * Create new ConcurrentStep
	 *
	 * @param  {Object} concurrentStepYaml An object representing a set of steps
	 *
	 *                  Examples:
	 *                    concurrentStepYaml === {
	 *                      simo: {
	 *                        IV: [ Step, Step, Step ],
	 *                        crewA: [ Step ],
	 *                        crewB: Step not in array
	 *                      }
	 *                    }
	 *                    concurrentStepYaml === {
	 *                        IV: [ Step, Step, Step ]
	 *                            <-- can't have second actor here in non-simo case
	 *                    }
	 *                    concurrentStepYaml === {
	 *                        IV: Step not in array
	 *                    }
	 * @param  {Object} taskRoles object of TaskRole objects. Example:
	 *                    taskRoles === {
	 *                      crewA: TaskRole{
	 *                        name: 'crewA',
	 *                        description: 'Crewmember exiting A/L first',
	 *                        actor: 'EV1'
	 *                      },
	 *                      crewB: TaskRole{
	 *                        name: 'crewB',
	 *                        description: 'Crewmember exiting A/L second',
	 *                        actor: 'EV2'
	 *                      }
	 *                    }
	 */
	constructor(concurrentStepYaml, taskRoles) {

		// First, check if this is a simo
		if (concurrentStepYaml.simo) {

			// Iterate over they keys (which are actor roles)
			for (const actorIdGuess in concurrentStepYaml.simo) {
				this.handleActorSteps(concurrentStepYaml, actorIdGuess, taskRoles);
			}

		// Not a simo, so just an actor role
		} else {

			// Get the actor role
			if (Object.keys(concurrentStepYaml).length !== 1) {
				throw new Error(`Expected a single actor role, but instead got ${JSON.stringify(concurrentStepYaml)}`);
			}

			const actorIdGuess = Object.keys(concurrentStepYaml)[0];

			this.handleActorSteps(concurrentStepYaml, actorIdGuess, taskRoles);
		}

	}

	handleActorSteps(concurrentStepYaml, actorIdGuess, taskRoles) {

		// if .simo exists, use it. Otherwise it's not a simo block and directly access actor
		const actorStepsYaml = concurrentStepYaml.simo ?
			concurrentStepYaml.simo[actorIdGuess] :
			concurrentStepYaml[actorIdGuess];

		const actorInfo = getActorInfo(actorIdGuess, taskRoles);

		// Get the actor steps array
		const actorSteps = getActorSteps(
			// use the "guess" here since that's what's in the user-supplied yaml
			actorStepsYaml,
			taskRoles,
			actorInfo.idOrIds
		);

		// Set the actor and steps in the object
		this[actorInfo.id] = actorSteps;

	}

};
