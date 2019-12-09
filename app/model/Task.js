'use strict';

const Duration = require('./Duration');
const ConcurrentStep = require('./ConcurrentStep.js');
const TaskRole = require('./TaskRole.js');
const consoleHelper = require('../helpers/consoleHelper');

function timeSyncRequired(task) {
	task.procedure.timeSync.updateStartTimesRequired = true;
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
		this.actorRolesDict[actor].startTime = time;
		timeSyncRequired(this); // this time updated, may affect other times

		if (this.actorRolesDict[actor].duration) {
			this.actorRolesDict[actor].endTime = Duration.sum(
				this.actorRolesDict[actor].startTime,
				this.actorRolesDict[actor].duration
			);
		}
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
		this.actorRolesDict[actor].endTime = time.clone();
		timeSyncRequired(this); // this time updated, may affect other times

		if (this.actorRolesDict[actor].duration) {
			this.actorRolesDict[actor].startTime = Duration.subtract(
				this.actorRolesDict[actor].endTime,
				this.actorRolesDict[actor].duration
			);
		}
		return this;
	}

	/**
	 * Set the duration of this task for a particular role. Also updates start time if end time is
	 * set, or end time if start time is set.
	 *
	 * @param {string} actor       Role for which to adjust end time, e.g. "crewA"
	 * @param {Duration} duration  Duration object specifying duration
	 * @return {Task}              Return this task for method chaining
	 */
	setDurationForRole(actor, duration) {
		this.actorRolesDict[actor].duration = duration.clone();
		timeSyncRequired(this); // this time updated, may affect other times

		if (this.actorRolesDict[actor].startTime) {
			this.actorRolesDict[actor].endTime = Duration.sum(
				this.actorRolesDict[actor].startTime,
				this.actorRolesDict[actor].duration
			);
		} else if (this.actorRolesDict[actor].endTime) {
			this.actorRolesDict[actor].startTime = Duration.subtract(
				this.actorRolesDict[actor].endTime,
				this.actorRolesDict[actor].duration
			);
		}
		return this;
	}

};
