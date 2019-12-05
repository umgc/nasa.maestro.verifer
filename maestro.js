/**
 * High-level functions for eva-tasklist
 */

'use strict';

const CommanderProgram = require('./app/model/CommanderProgram');
const terminal = new CommanderProgram();

module.exports = {

	/**
	 * Surrogate program entry point
	 *
	 * @param   {*} args Command line arguments
	 */
	run: function(args) {
		console.log(`${terminal.fullName}\n`);

		// Use Commander to process command line arguments
		terminal.buildProgramArguments(args);
	}
	// buildProgramArguments: buildProgramArguments,
	// validateProgramArguments: validateProgramArguments
};
