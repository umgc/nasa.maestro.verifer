/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const childProcess = require('child_process');
const path = require('path');
const assert = require('chai').assert;

const CommanderProgram = require('../../model/CommanderProgram');
const Procedure = require('../../model/Procedure');

const EvaDocxProcedureWriter = require('./EvaDocxProcedureWriter');

describe('ProcedureWriter', function() {
	const procedure = new Procedure();
	const procedureFile = path.join(__dirname, '../../../test/cases/simple/procedures/proc.yml');

	const err = procedure.addProcedureDefinitionFromFile(procedureFile);
	if (err) {
		throw new Error(err);
	}

	// using an EvaDocxProcedureWriter because the abstract ProcedureWriter isn't meant to be used
	// on its own
	const procWriter = new EvaDocxProcedureWriter(new CommanderProgram(), procedure);

	describe('getGitHash', function() {

		it('should get a short SHA for the repo', function() {

			procWriter.program.gitPath = '.git';
			procWriter.program.projectPath = '.';
			const currentGitHash = childProcess
				.execSync('git rev-parse --short HEAD')
				.toString().trim();
			assert.equal(procWriter.program.getGitHash(), currentGitHash);
		});
	});
});
