'use strict';

const path = require('path');

const CommanderProgram = require('../../app/model/CommanderProgram');
const Procedure = require('../../app/model/Procedure');

module.exports = function(procPathFromCases, writerType, taskIndex = 0) {

	const procedureWriterPath = `../../app/writer/procedure/${writerType}ProcedureWriter.js`;
	const taskWriterPath = `../../app/writer/task/${writerType}TaskWriter.js`;

	const DesiredProcedureWriter = require(procedureWriterPath);
	const DesiredTaskWriter = require(taskWriterPath);

	const procedure = new Procedure();
	const procedureFile = path.join(__dirname, '../cases', procPathFromCases);

	const err = procedure.addProcedureDefinitionFromFile(procedureFile);
	if (err) {
		throw new Error(err);
	}

	const procWriter = new DesiredProcedureWriter(new CommanderProgram(), procedure);
	const taskWriter = new DesiredTaskWriter(
		procedure.tasks[taskIndex],
		procWriter
	);

	return taskWriter;
};
