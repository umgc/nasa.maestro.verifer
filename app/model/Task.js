'use strict';

const Duration = require('./Duration');
const ConcurrentStep = require('./ConcurrentStep.js');
const TaskRole = require('./TaskRole.js');
const consoleHelper = require('../helpers/consoleHelper');
const arrayHelper = require('../helpers/arrayHelper');

const validTimeTypes = ['startTime', 'endTime', 'duration'];

function timeSyncRequired(task) {
	task.procedure.timeSync.updateStartTimesRequired = true;
}

/**
 * From inputs of two types, get the third type
 * @param {string} first   Either startTime, endTime, or duration
 * @param {string} second  Either startTime, endTime, or duration (but not the same as first)
 * @return {string}        The third type, whichever first and second is not.
 */
function getThirdTimeType(first, second) {
	if (!arrayHelper.isAnyOf(first, validTimeTypes) ||
		!arrayHelper.isAnyOf(second, validTimeTypes)) {

		throw new Error(`Two time types required, and must be in ${JSON.stringify(validTimeTypes)}`);
	} else if (first === second) {
		throw new Error('First and second paramaters should not be the same');
	}

	const inputs = {
		duration: first === 'duration' || second === 'duration',
		startTime: first === 'startTime' || second === 'startTime',
		endTime: first === 'endTime' || second === 'endTime'
	};
	for (const type in inputs) {
		if (inputs[type] === false) {
			// this input not present, return it
			return type;
		}
	}
}

/**
 * Based upon another time (that has probably been recently changed...at least that's the point of
 * this function) update another time if the third time type is defined. For example, if the
 * startTime was just changed, and the duration is defined, update the endTime by start + duration.
 *
 * Note on implementation: Getting the endTime requires addition of start and duration. Getting the
 * duration or startTime requires subtraction of one from the endTime. So which action to take, sum
 * or subtract, must be determined.
 *
 * @param {TaskRole} taskRole
 * @param {string} recentlyChanged
 * @param {string} tryToChange
 */
function updateDependentTime(taskRole, recentlyChanged, tryToChange) {
	const third = getThirdTimeType(recentlyChanged, tryToChange);
	let change;

	if (tryToChange === 'startTime' && taskRole[third]) {
		change = {
			action: 'subtract',
			firstOperand: 'endTime',
			secondOperand: 'duration',
			ifPropPresent: third
		};

	} else if (tryToChange === 'endTime' && taskRole[third]) {
		change = {
			action: 'sum',
			firstOperand: 'startTime',
			secondOperand: 'duration',
			ifPropPresent: third
		};
	} else if (taskRole[third]) { // tryToChange === duration
		change = {
			action: 'subtract',
			firstOperand: 'endTime',
			secondOperand: 'startTime',
			ifPropPresent: third
		};
	} else {
		return;
	}

	taskRole[tryToChange] = Duration[change.action](
		taskRole[change.firstOperand],
		taskRole[change.secondOperand]
	);
}

/**
 * Helper function to perform time update exposed in exported functions
 * @param {Task} task                 Task on which to set time
 * @param {string} actor              Actor to set time for
 * @param {string} timeType           Either 'startTime, 'duration', or 'endTime'
 * @param {Duration} time             Duration object specifying time to be set
 * @param {string} dependentTimeType  Either 'startTime, 'duration', or 'endTime'. Not === timeType
 */
function doTimeUpdate(task, actor, timeType, time, dependentTimeType) {
	task.actorRolesDict[actor][timeType] = time.clone();
	timeSyncRequired(task); // this time was updated and may affect other times in procedure
	updateDependentTime(task.actorRolesDict[actor], timeType, dependentTimeType);
}

module.exports = class Task {

	/**
	 * Constructor for Task object
	 * @param  {Object} taskDefinition          All the task info from the task file (steps, etc)
	 * @param  {Object} proceduresTaskInstance  Info about this usage of task from procedure file
	 * @param  {Array}  procedureColumnKeys     Array of column keys
	 * @param  {Object} procedure               Procedure instance
	 *                                          OPTIMIZE: the procedure param was added later when
	 *                                          it became obvious that tasks would need general info
	 *                                          about procedures. Now it seems excessive to have the
	 *                                          prior two params be part of the procedure param
	 */
	constructor(taskDefinition, proceduresTaskInstance, procedureColumnKeys, procedure) {

		// Get the title
		if (!taskDefinition.title) {
			throw new Error(`Input YAML task missing title: ${JSON.stringify(taskDefinition)}`);
		}
		this.title = taskDefinition.title;

		if (taskDefinition.roles) {
			this.rolesDict = {};
			this.rolesArr = [];
			this.actorRolesDict = {};
			for (const role of taskDefinition.roles) {
				if (!role.name) {
					consoleHelper.error([
						'Roles require a name, none found in role definition',
						role
					], 'Task role definition error');
				}
				this.rolesDict[role.name] = new TaskRole(role, proceduresTaskInstance);
				this.rolesArr.push(this.rolesDict[role.name]);

				// task defines roles, procedure applies actors to roles in TaskRole object. Get
				// "actor" for this task from that.
				const actor = this.rolesDict[role.name].actor;

				this.actorRolesDict[actor] = this.rolesDict[role.name]; // for convenience
			}
		}

		this.color = proceduresTaskInstance.color || null;
		this.filename = proceduresTaskInstance.file;

		// Get the steps.  ConcurrentSteps class will handle the simo vs actor stuff in the yaml.
		if (!taskDefinition.steps) {
			throw new Error(`Input YAML task missing steps: ${JSON.stringify(taskDefinition)}`);
		}
		this.concurrentSteps = [];
		for (var concurrentStepYaml of taskDefinition.steps) {
			this.concurrentSteps.push(new ConcurrentStep(concurrentStepYaml, this.rolesDict));
		}

		if (procedureColumnKeys) {
			if (!Array.isArray(procedureColumnKeys) || procedureColumnKeys.length === 0) {
				throw new Error('Procedure column keys must be an array with length > 0\n');
			} else {
				for (const key of procedureColumnKeys) {
					if (typeof key !== 'string') {
						throw new Error('Procedure column keys must be type string');
					}
				}
			}
			this.procedureColumnKeys = procedureColumnKeys;
		}
		this.procedure = procedure;
	}

	/**
	 * Detect and return what columns are present on a task. A given task may
	 * have 1 or more columns. Only return those present in a task.
	 *
	 * @return {Array}             Array of column names in this task
	 */
	getColumns() {

		if (this.columnsArray) {
			return this.columnsArray;
		}

		const divisions = this.concurrentSteps;
		const taskColumns = [];
		const taskColumnsHash = {};
		let division,
			colKey,
			actorKey;

		// Loop over the array of divisions, and within that loop over each object of
		// actorKey:[array,of,steps].
		//
		// divisions = [
		//   { IV: [Step, Step, Step] },              // division (row) 0
		//   { IV: [Step], EV1: [Step, Step] },       // division (row) 1
		//   { EV1: [Step, Step], EV2: [Step] }       // division (row) 2
		// ]
		//
		for (division of divisions) {
			for (actorKey in division) {
				colKey = this.procedure.getActorColumnKey(actorKey);

				if (!taskColumnsHash[colKey]) {
					// insert into a hash table because lookup is faster than array
					taskColumnsHash[colKey] = true;
				}
			}
		}

		// create taskColumns in order specified by procedure
		for (colKey of this.procedureColumnKeys) {
			if (taskColumnsHash[colKey]) {
				taskColumns.push(colKey);
			}
		}

		this.columnsArray = taskColumns;
		return taskColumns;
	}

	getColumnIndex(actorKey) {
		const columnIndexes = this.getColumnIndexes();
		if (typeof columnIndexes[actorKey] === 'undefined') {
			throw new Error(`Unknown actor "${actorKey}" passed to getColumnIndex.
				Column index = ${JSON.stringify(columnIndexes)}`);
		} else {
			return columnIndexes[actorKey];
		}

	}

	getColumnIndexes() {

		if (this.columnIndexes) {
			return this.columnIndexes;
		}

		this.columnIndexes = {};
		const taskColumns = this.getColumns();

		for (let i = 0; i < taskColumns.length; i++) {
			this.columnIndexes[taskColumns[i]] = i;
		}

		return this.columnIndexes;
	}

	/**
	 * Set the start time of this task for a particular role. Also updates end time if duration is
	 * set.
	 *
	 * @param {string} actor    Role for which to adjust start time, e.g. "crewA"
	 * @param {Duration} time  Duration object specifying start time
	 * @return {Task}          Return this task for method chaining
	 */
	setStartTimeForRole(actor, time) {
		doTimeUpdate(this, actor, 'startTime', time, 'endTime');
		return this;
	}

	/**
	 * Set the start time of this task for a particular role. Also updates start time if duration is
	 * set.
	 *
	 * @param {string} actor    Role for which to adjust end time, e.g. "crewA"
	 * @param {Duration} time  Duration object specifying end time
	 * @return {Task}          Return this task for method chaining
	 */
	setEndTimeForRole(actor, time) {
		doTimeUpdate(this, actor, 'endTime', time, 'startTime');
		return this;
	}

	/**
	 * Set the duration of this task for a particular role. Also updates end time if start time is
	 * set.
	 *
	 * @param {string} actor       Role for which to adjust end time, e.g. "crewA"
	 * @param {Duration} time      Duration object specifying duration
	 * @return {Task}              Return this task for method chaining
	 */
	setDurationForRole(actor, time) {
		doTimeUpdate(this, actor, 'duration', time, 'endTime');
		return this;
	}

};
