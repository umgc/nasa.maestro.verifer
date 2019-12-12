/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const path = require('path');
const assert = require('chai').assert;
// const PNG = require('pngjs').PNG; // attempted to use for PNG checking. See writePNG() below.

const Procedure = require('../../app/model/Procedure');

const tests = [
	{
		file: 'cases/simple/procedures/proc.yml',
		expected: {
			columns: ['EV1', 'EV3'],
			actorToTimelineColumn: { EV1: 0, EV3: 1 },
			minutesToPixels: {
				0: [0, 0],
				30.5: [640, 640.5],
				59.123: [1241, 1241.5829999999999],
				97: [2037, 2037],
				120.123: [2522, 2522.583]
			}
		}
	},
	{
		file: 'cases/complex-times/procedures/proc.yml',
		expected: {
			columns: ['EV3', 'EV4', 'EV1', 'EV2'],
			actorToTimelineColumn: { EV3: 0, EV4: 1, EV1: 2, EV2: 3 },
			minutesToPixels: {
				0: [0, 0],
				31: [43, 43.4],
				59: [82, 82.6],
				90: [125, 125.99999999999999], // note possibly bad rounding here
				123: [172, 172.2],
				151: [211, 211.39999999999998]
			}
		}
	}
];

function createProcedure(filepath) {
	const procedure = new Procedure();
	const err = procedure.addProcedureDefinitionFromFile(filepath);
	if (err) {
		throw new Error(err);
	}
	return procedure;
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

	testCreate() {
		for (const test of this.tests) {

			const first = test.timeline.create();

			it(`should return a string of non-trivial length for ${test.file}`, function() {
				assert.isString(first);
				assert.isAtLeast(first.length, 20);
			});

			const second = test.timeline.create();

			it(`should be idempotent for ${test.file}`, function() {
				assert.equal(first, second);
			});
		}
	}

};
