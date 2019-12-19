/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const assert = require('chai').assert;
// const PNG = require('pngjs').PNG; // attempted to use for PNG checking. See writePNG() below.

const TimelineWriter = require('../app/writer/timeline/TimelineWriter');
const TimelineWriterTester = require('./helpers/TimelineWriterTester');
const tester = new TimelineWriterTester(TimelineWriter);

describe('TimelineWriter', function() {

	describe('constructor', function() {
		for (const test of tester.tests) {
			it(`should setup columns for ${test.file}`, function() {
				assert.deepEqual(test.timeline.columns, test.expected.columns);
				assert.deepEqual(
					test.timeline.actorToTimelineColumn,
					test.expected.actorToTimelineColumn
				);
			});
		}
	});

	describe('minutesToPixels()', function() {
		for (const test of tester.tests) {
			for (const input in test.expected.minutesToPixels) {

				it(`should get rounded pixels for ${test.file} and ${input} minutes`, function() {
					assert.strictEqual(
						test.timeline.minutesToPixels(input), // actual with rounding
						test.expected.minutesToPixels[input][0] // expected
					);
				});

				it(`should get un-rounded pixels for ${test.file} and ${input} minutes`, function() {
					assert.strictEqual(
						test.timeline.minutesToPixels(input, false), // actual no round
						test.expected.minutesToPixels[input][1] // expected
					);
				});
			}
		}
	});

});
