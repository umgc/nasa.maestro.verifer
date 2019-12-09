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

		return new Promise((resolveOuter, rejectOuter) => {

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
						const taskLoadPromises = [];
						for (const task of this.procedure.procedureDefinition.tasks) {
							taskLoadPromises.push(this.loadTask(task.file));
						}
						Promise.all(taskLoadPromises)
							.then(() => {
								this.procedure.setupTimeSync();
								resolveOuter();
							})
							.catch((error) => {
								rejectOuter(error);
							});
					}
				});

		});
	}

	loadTask(taskFilename) {
		if (!this.procedure) {
			return Promise.reject(new Error('Must load procedure for loading tasks'));
		}

		return new Promise((resolve, reject) => {
			fetch(encodeURI(`tasks/${taskFilename}`))
				.then((response) => {
					return response.text();
				})
				.then((text) => {
					const err = this.procedure.updateTaskDefinition(
						taskFilename,
						YAML.safeLoad(text)
					);
					if (err) {
						reject(new Error(err));
					} else {
						resolve(true);
					}
				});

		});
	}

};
