/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('chai').assert;
// const PNG = require('pngjs').PNG; // attempted to use for PNG checking. See writePNG() below.

const Procedure = require('../app/model/Procedure');

const tests = [
	{
		file: 'cases/simple/procedures/proc.yml',
		expected: {
			columns: ['EV1', 'EV3'],
			actorToTimelineColumn: { EV1: 0, EV3: 1 },
			minutesToPixels: {
				0: 0,
				30: 630,
				60: 1260,
				90: 1890,
				120: 2520
			}
		}
	},
	{
		file: 'cases/complex-times/procedures/proc.yml',
		expected: {
			columns: ['EV3', 'EV4', 'EV1', 'EV2'],
			actorToTimelineColumn: { EV3: 0, EV4: 1, EV1: 2, EV2: 3 },
			minutesToPixels: {
				0: 0,
				30: 42,
				60: 84,
				90: 125, // note rounding here
				120: 168,
				150: 210
			}
		}
	}
];

function createProcedure(filepath) {
	const procedure = new Procedure();
	const err = procedure.populateFromFile(filepath);
	if (err) {
		throw new Error(err);
	}
	return procedure;
}

for (const test of tests) {
	const filepath = path.join(__dirname, test.file);

	// create the procedure associated with this file
	test.procedure = createProcedure(filepath);

	// Create Procedure.toJSON() to handle circular refs, then use it to determine idempotency here
	// create it again, for use in idempotency tests
	// test.expected.untouchedProcedure = createProcedure(test.file);

	test.timeline = new TimelineWriter(test.procedure);

	test.buildDir = path.join(filepath, '../../build');
}

module.exports = class TimelineWriterTester {

	constructor(TimelineWriterClass) {

		this.tests = tests;

		for (const test of tests) {
			const filepath = path.join(__dirname, '..', test.file);

			// create the procedure associated with this file
			test.procedure = createProcedure(filepath);

			// Create Procedure.toJSON() to handle circular refs, then use it to determine
			// idempotency here...create it again, for use in idempotency tests
			// test.expected.untouchedProcedure = createProcedure(test.file);

			test.timeline = new TimelineWriterClass(test.procedure);

			test.buildDir = path.join(filepath, '../../build');
		}

	}

};
