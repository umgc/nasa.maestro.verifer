'use strict';

const ProcedureWriter = require('./ProcedureWriter');

module.exports = class ReactProcedureWriter extends ProcedureWriter {

	constructor(program, procedure) {
		super(program, procedure, false);
	}

	// extending ProcedureWriter requires this...for now.
	writeFile() { return false; }

};
