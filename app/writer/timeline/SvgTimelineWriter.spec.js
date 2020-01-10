/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('chai').assert;
// const PNG = require('pngjs').PNG; // attempted to use for PNG checking. See writePNG() below.

const SvgTimelineWriter = require('./SvgTimelineWriter');
const TimelineWriterTester = require('../../../test/helpers/TimelineWriterTester');

describe('SvgTimelineWriter', function() {

	const tester = new TimelineWriterTester(SvgTimelineWriter);

	describe('create()', function() {
		tester.testCreate();
	});

	describe('writeSVG()', function() {
		for (const test of tester.tests) {

			const { timeline, procedure, buildDir } = tester.setup(test);

			// in case 'create()' tests haven't been run yet
			// if (!test.timeline.canvas) {
			timeline.create();
			// }

			const expectedPath = path.join(
				buildDir, `${procedure.filename}.summary.timeline.svg`
			);
			const testPath = path.join(
				buildDir, `test${procedure.filename}.summary.timeline.svg`
			);

			timeline.writeSVG(testPath);
			const expectedSVG = fs.readFileSync(expectedPath).toString();
			const testSVG = fs.readFileSync(testPath).toString();

			// NOTE: Do this outside the assert so when different a huge incomprehensible diff
			// doesn't get printed to the terminal
			const goodMsg = 'SVG generated by tests matches expected';
			const msg = (expectedSVG === testSVG) ?
				goodMsg :
				'SVG generated by tests DOES NOT match expected';

			it(`should create expected SVG for ${test.file}`, function() {
				assert.strictEqual(msg, goodMsg); // see NOTE above
			});
		}
	});

	/**
	 * This works locally, but fails when run in Travis CI. Perhaps the PNGs created in Travis are
	 * generated using different compression libraries. To attempt to get around this, pngjs was
	 * used to read the PNGs pixel-for-pixel, but that was also unsuccessful (though only moderate
	 * effort was given). The code below assumes pngjs is installed, but it may have been removed
	 * as a dependency at this point.
	describe('writePNG()', function() {
		for (const test of tester.tests) {

			// in case 'create()' tests haven't been run yet
			if (!test.timeline.canvas) {
				test.timeline.create();
			}

			const expectedPath = path.join(
				test.buildDir, `${test.procedure.filename}.summary.timeline.png`
			);
			const testPath = path.join(
				test.buildDir, `test${test.procedure.filename}.summary.timeline.png`
			);

			it(`should create expected PNG for ${test.file}`, function(done) {
				test.timeline.writePNG(testPath, function() {
					// const expectedPNG = fs.readFileSync(expectedPath).toString();
					// const testPNG = fs.readFileSync(testPath).toString();
					const expectedPNG = PNG.sync.read(fs.readFileSync(expectedPath));
					const testPNG = PNG.sync.read(fs.readFileSync(testPath));

					// NOTE: Do this outside the assert so when different a huge incomprehensible
					// diff doesn't get printed to the terminal
					const goodMsg = 'PNG generated by tests matches expected';
					let msg = goodMsg;
					try {
						// If assertion fails, swallow exception to keep mocha from printing diff
						assert.deepEqual(testPNG, expectedPNG);
					} catch (failedAssertion) {
						msg = 'PNG generated by tests DOES NOT match expected';
					}

					assert.strictEqual(msg, goodMsg); // see NOTE above

					done();
				});
			});
		}
	});
	 */

});
