'use strict';

const CommanderProgram = require('./app/model/CommanderProgram');
const program = new CommanderProgram();

module.exports = {

	/**
	 * Surrogate program entry point
	 *
	 * @param {Array} args  Command line arguments
	 */
	run: function(args) {
		console.log(`${program.fullName}\n`);

		// Use Commander to process command line arguments
		program.buildProgramArguments();

		program.process(args);
	}
};
