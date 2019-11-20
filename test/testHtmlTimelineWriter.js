/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const path = require('path');
const assert = require('chai').assert;
// const PNG = require('pngjs').PNG; // attempted to use for PNG checking. See writePNG() below.

const HtmlTimelineWriter = require('../app/writer/timeline/HtmlTimelineWriter');
const Procedure = require('../app/model/Procedure');

const tests = [
	{
		file: 'cases/simple/procedures/proc.yml'
	},
	{
		file: 'cases/complex-times/procedures/proc.yml'
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

	test.timeline = new HtmlTimelineWriter(test.procedure);

	test.buildDir = path.join(filepath, '../../build');
}

describe('HtmlTimelineWriter', function() {

	describe('create()', function() {
		for (const test of tests) {

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
	});

});
