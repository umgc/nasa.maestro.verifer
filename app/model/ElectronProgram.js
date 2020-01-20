'use strict';

const path = require('path');

// const YAML = require('js-yaml');

const Program = require('./Program');
const Procedure = require('./Procedure');

module.exports = class ElectronProgram extends Program {

	constructor(reactAppComponent) {
		super();
		this.isElectron = true;
		this.reactAppComponent = reactAppComponent; // bind react App component to this
		this.reactAppComponent.setProgram(this); // bind this to react App component
	}

	loadProcedure(procedureFilepath) {
		console.log('running load program');
		const projectPath = path.dirname(path.dirname(procedureFilepath));
		this.setPathsFromProject(projectPath);

		this.procedure = new Procedure();
		this.procedure.addProcedureDefinitionFromFile(procedureFilepath);

		this.reactAppComponent.setProcedure(this.procedure);
	}

	getHtmlImagePath(filename) {
		// needed to retrieve them in browser
		const ip = `file://${this.imagesPath.replace(/\\/g, '/')}`;
		return `${ip}/${filename}`
			.replace(/#/g, '%23'); // no # in URL (FIXME, need to figure out all possiblities)
	}

};
