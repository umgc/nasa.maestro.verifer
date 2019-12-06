'use strict';

// const path = require('path');
// const fs = require('fs');
// const commander = require('commander');

const Program = require('./Program');

/*
const Procedure = require('./Procedure');
const EvaDocxProcedureWriter = require('../writer/procedure/EvaDocxProcedureWriter');
const SodfDocxProcedureWriter = require('../writer/procedure/SodfDocxProcedureWriter');
const EvaHtmlProcedureWriter = require('../writer/procedure/EvaHtmlProcedureWriter');

const consoleHelper = require('../helpers/consoleHelper');
*/

module.exports = class WebProgram extends Program {

	constructor() {
		super();
	}

	/**
	 * Validates the arguments...
	 *
	 */
	/*
	validateProgramArguments() {

		this.procedurePath = path.join(this.projectPath, 'procedures');
		this.tasksPath = path.join(this.projectPath, 'tasks');
		this.imagesPath = path.join(this.projectPath, 'images');
		this.outputPath = path.join(this.projectPath, 'build');
		this.gitPath = path.join(this.projectPath, '.git');

		pathMustExist(this.procedurePath);
		pathMustExist(this.tasksPath);

		// at this point tasks and procedures paths exist. Reasonably certain this
		// is an xOPS project. Allow forcing creation of outputPath with `true`.
		pathMustExist(this.outputPath, true);

		//  If this process can't write to the output location, emit an error and quit
		if (!canWrite(this.outputPath)) {
			console.error(`Can't write to output location: ${this.outputPath}`);
			process.exit();
		}

		throw new Error('what to do with this function?????');

    }
    */

};
