'use strict';

const typeHelper = require('../helpers/typeHelper');
const Task = require('./Task');

const tasksByFile = {};

module.exports = class TasksHandler {

	/**
	 *
	 * @param {Array} procTaskDefs   Receieves the "tasks" array from procedure definition
	 * @param {Procedure} procedure  Procedure model
	 */
	constructor(procTaskDefs, procedure) {

		// this has to be done here to avoid cirular references
		const Procedure = require('./Procedure');

		typeHelper.errorIfIsnt(procTaskDefs, 'array');
		typeHelper.errorIfIsnt(procedure, Procedure);

		this.tasks = [];
		this.procedure = procedure;

		procTaskDefs.forEach((taskDef, index) => {
			const task = new Task(taskDef, procedure);
			this.tasks[index] = task;
			tasksByFile[task.taskReqs.file] = task;
		});
	}

	getDefinition() {
		return {
			requirements: this.getRequirementsDefinitions(),
			tasks: this.getTaskDefinitions()
		};
	}

	getRequirementsDefinitions() {
		return this.tasks.map((task) => {
			return task.getRequirementsDefinition();
		});
	}

	getTaskDefinitions() {
		const def = {};
		for (const task of this.tasks) {
			def[task.taskReqs.file] = task.getTaskDefinition();
		}
		return def;
	}

	getTaskByFile(taskFile) {
		if (!tasksByFile[taskFile]) {
			throw new Error(`Task with file name ${taskFile} not found!`);
		}
		return tasksByFile[taskFile];
	}

};
