'use strict';

const YAML = require('js-yaml');

const Program = require('./Program');
const Procedure = require('./Procedure');

module.exports = class WebProgram extends Program {

	constructor() {
		super();
	}

	loadProcedure(procedureFilename) {

		this.procedure = new Procedure();

		fetch(encodeURI(`procedures/${procedureFilename}`))
			.then((response) => {
				return response.text();
			})
			.then((text, reject) => {
				const err = this.procedure.addProcedureDefinition(YAML.safeLoad(text));
				if (err) {
					reject(new Error(err));
				} else {
					console.log('Procedure loaded. See maestro.app.procedure');
					for (const task of this.procedure.procedureDefinition.tasks) {
						this.loadTask(task.file);
					}
				}
			});

	}

	loadTask(taskFilename) {
		if (!this.procedure) {
			throw new Error('Must load procedure for loading tasks');
		}

		fetch(encodeURI(`tasks/${taskFilename}`))
			.then((response) => {
				return response.text();
			})
			.then((text) => {
				this.procedure.updateTaskDefinition(
					taskFilename,
					YAML.safeLoad(text)
				);
			});
	}

};
