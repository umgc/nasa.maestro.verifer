'use strict';

const typeHelper = require('../helpers/typeHelper');
const Task = require('./Task');
const subscriptionHelper = require('../helpers/subscriptionHelper');

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
		this.taskUuidToObj = {};
		this.procedure = procedure;

		this.subscriberFns = {
			deleteTask: [],
			insertTask: [],
			moveTask: []
		};

		procTaskDefs.forEach((procTaskDef, index) => {
			const task = new Task(procTaskDef, procedure);
			this.tasks[index] = task;
			this.taskUuidToObj[task.uuid] = task;
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

	// FIXME this is copied* directly from ~~Step~~ Series. Create "ReloadableModel" and make them
	// extend it?
	// and that may be a better place than the subscriptionHelper.js file, except that maybe the
	// stateHandler logic needs it, too...?
	//
	// * copied, then refactored since Series has way more subscribable functions
	subscribe(subscriptionMethod, subscriberFn) {
		const unsubscribeFn = subscriptionHelper.subscribe(
			subscriberFn,
			this.subscriberFns[subscriptionMethod]
		);
		return unsubscribeFn;
	}

	getTaskByFile(taskFile) {
		if (!tasksByFile[taskFile]) {
			throw new Error(`Task with file name ${taskFile} not found!`);
		}
		return tasksByFile[taskFile];
	}

	getTaskIndexByUuid(uuid) {
		for (let i = 0; i < this.tasks.length; i++) {
			if (this.tasks[i].uuid === uuid) {
				return i;
			}
		}
		return -1;
	}

	getTaskIndexesByUuids(uuidArray) {
		const allUuidsArray = this.tasks.map((task) => task.uuid);
		const out = {};
		for (const wantedUuid of uuidArray) {
			out[wantedUuid] = allUuidsArray.indexOf(wantedUuid);
		}
		return out;
	}

	deleteTask(index) {
		console.log('TasksHandler.deleteTask');
		const [removedTask] = this.tasks.splice(index, 1);

		this.taskUuidToObj[removedTask.uuid] = null;
		tasksByFile[removedTask.taskReqs.file] = null;

		this.procedure.setupTimeSync(); // FIXME is there a cheaper way to do this?
		subscriptionHelper.run(this.subscriberFns.deleteTask, this);
	}

	insertTask(index, task = false) {
		console.log('TasksHandler.insertTask');
		if (!task) {
			task = this.makeTask();
		}
		this.tasks.splice(index, 0, task);

		// FIXME there's probably a cleaner way to handle doing this in multiple spots
		this.taskUuidToObj[task.uuid] = task;
		tasksByFile[task.taskReqs.file] = task;

		this.procedure.setupTimeSync(); // FIXME is there a cheaper way to do this?
		subscriptionHelper.run(this.subscriberFns.insertTask, this);
	}

	moveTask(oldIndex, newIndex) {
		console.log(`TasksHandler.moveTask(${oldIndex}, ${newIndex})`);

		const [taskToMove] = this.tasks.splice(oldIndex, 1);
		const realInsertIndex = oldIndex < newIndex ? newIndex - 1 : newIndex;

		this.tasks.splice(realInsertIndex, 0, taskToMove);

		// FIXME is there a cheaper way to do this?
		this.clearNextAndPreviousTasks();
		this.procedure.setupTimeSync();

		subscriptionHelper.run(this.subscriberFns.moveTask, this);
	}

	syntaxerror - that will lead us here
	// TOMORROW
	//    create Task.canonicalRoles ==> task.rolesArr.map((taskRole) => taskRole.name)  +  procedure.getAstreriskColumnKey()
	//    generate .steps below from canonicalRoles, filling in text like "One small step"
	//    verify works okay with maestro.state.state.procedure.TasksHandler.insertTask(0);
	//
	// Make modal form box component
	//
	// Then make form with:
	//    .title --> filenamify to .file  - verify not a used filename (either in model or on disk)
	//    .color  (just a text box for now)
	//    .rolesNeeded [{ roleName, description, duration }]
	//    .rolesCast {roleName1: actor1, roleName2: actor2 }
	//       Flatten ^ into:
	//           title: textbox
	//           color: textbox
	//           roles: (multiple instance thing)
	//              role name: textbox with validation of good role name, words like "crewA" or "ssrmsCrew"
	//              description: textbox (optional)
	//              duration: hour / minute textboxes   ALSO OFFSET
	//              filled by actor: textbox, words like "EV1", "EV2" <-- enforce comes from columns
	//
	//    Make ^ edit existing
	//    Then make it work for insert new (using command line to insert)
	//    Then make insert-new buttons somewhere
	//
	//
	makeTask({ file, rolesCast, color } = {}, { title, rolesNeeded, steps } = {}) {
		file = file || 'Temp_Name';
		rolesCast = rolesCast || { crewA: 'EV1', crewB: 'EV2' };
		color = color || '#FFDEAD';
		const task = new Task({ file, roles: rolesCast, color }, this.procedure);
		title = title || 'Temp Name';
		rolesNeeded = rolesNeeded || [{ name: 'crewA', duration: { hours: 1 } }];
		steps = steps || [{ simo: { IV: [], EV1: [], EV2: [] } }];
		task.addTaskDefinition({ title, roles: rolesNeeded, steps });
		return task;
	}

	getTaskUuids() {
		return this.tasks.map((task) => {
			return task.uuid;
		});
	}

	clearNextAndPreviousTasks() {
		for (const task of this.tasks) {
			for (const role in task.actorRolesDict) {
				task.actorRolesDict[role].nextTask = null;
				task.actorRolesDict[role].prevTask = null;
			}
		}
	}

	getNextUuids(uuid) {
		const taskIndex = this.getTaskIndexByUuid(uuid);
		const task = this.tasks[taskIndex];
		const nextTasks = {};
		for (const actor in task.actorRolesDict) {
			if (task.actorRolesDict[actor].nextTask) {
				nextTasks[task.actorRolesDict[actor].nextTask.uuid] = true;
			}
		}
		return Object.keys(nextTasks);
	}

};
