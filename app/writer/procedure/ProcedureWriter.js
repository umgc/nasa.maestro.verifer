'use strict';

const clonedeep = require('lodash/cloneDeep');
const Abstract = require('../../helpers/Abstract');

module.exports = class ProcedureWriter extends Abstract {

	constructor(program, procedure, clone = true) {
		super(['writeFile']);
		this.program = program;

		// clone for gauranteed idempotency, so one Writer can't impact another
		if (clone) {
			this.procedure = clonedeep(procedure);
		} else {
			this.procedure = procedure;
		}
	}

	getTaskDurationDisplay(task) {
		const durationDisplays = [];
		let durationDisplay;

		for (const role of task.rolesArr) {
			durationDisplays.push(role.duration.format('H:M'));
		}

		// if all the duration displays are the same
		if (durationDisplays.every((val, i, arr) => val === arr[0])) {
			durationDisplay = durationDisplays[0];

		// not the same, concatenate them
		} else {
			durationDisplay = durationDisplays.join(' / ');
		}

		return durationDisplay;
	}

	getDocMeta() {
		const docMeta = {
			title: this.procedure.procedure_name,
			lastModifiedBy: this.program.getLastModifiedBy(),
			creator: this.program.fullName
		};
		if (this.procedure.description) {
			docMeta.description = this.procedure.description; // FIXME: not implemented
		}
		return docMeta;
	}

	renderTasks() {
		for (const task of this.procedure.tasks) {
			this.renderTask(task);
		}
	}

};
