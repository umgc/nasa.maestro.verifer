/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('chai').assert;

const puppeteer = require('puppeteer');
const resemble = require('node-resemble-js');

const CommanderProgram = require('../../model/CommanderProgram');
const Procedure = require('../../model/Procedure');

const EvaHtmlProcedureWriter = require('./EvaHtmlProcedureWriter');

const tests = [
	{ file: 'simple/procedures/proc.yml', mismatchThreshold: 1.57 },
	{ file: 'complex-times/procedures/proc.yml', mismatchThreshold: 1.94 }
];

describe('EvaHtmlProcedureWriter', function() {
	for (const test of tests) {
		const procedure = new Procedure();
		const procedureFile = path.join(__dirname, '../../../test/cases', test.file);

		const err = procedure.addProcedureDefinitionFromFile(procedureFile);
		if (err) {
			throw new Error(err);
		}
		// const procedureClone = clonedeep(procedure);

		const buildDir = path.join(procedureFile, '../../build');
		const htmlPath = path.join(buildDir, `${procedure.filename}.html`);
		const expectedPath = path.join(buildDir, `${procedure.filename}.html.jpg`);
		const testPath = path.join(buildDir, `test${procedure.filename}.html.jpg`);

		const procWriter = new EvaHtmlProcedureWriter(new CommanderProgram(), procedure);
		procWriter.renderIntro();
		procWriter.renderTasks();
		procWriter.writeFile(htmlPath);

		describe(`compare full-page screenshot for ${test.file}`, function() {

			before(async function() {
				this.timeout(10000);

				const browser = await puppeteer.launch();
				const page = await browser.newPage();
				const contentHtml = fs.readFileSync(htmlPath, 'utf8');
				await page.setContent(contentHtml);

				// Or use raw HTML rather than pulling from file. Pulling from file also tests
				// EvaHtmlProcedureWriter.writeFile() though.
				// await page.setContent( /* raw html string */);

				await page.screenshot({
					path: testPath,
					fullPage: true
				});
				await browser.close();
			});

			it(`should create expected screenshot of webpage for ${procedure.filename}.html`, function(done) {
				this.timeout(10000);

				// Screenshots must match within % below.
				// Ideally this would be an exact match or something really low like 0.01%, but due
				// to difference in fonts on Windows vs Linux an exact match isn't possible. We want
				// to use Arial, at least for now, due to complying with SODF standards, but that
				// is a proprietary font. It can be installed on Linux but is not by default.
				//
				// NOTE: the value chosen below is deliberately bracketing the current worst-case
				// test. It can be moved up or down as makes sense.
				const mismatch = test.mismatchThreshold;

				// allow the size of the image to vary by a small percentage
				const sizeDifferenceThreshold = 0;

				resemble(expectedPath)
					.compareTo(testPath)
					.onComplete(function(data) {
						const actualMatch = parseFloat(data.misMatchPercentage);
						assert.isAtMost(
							actualMatch,
							mismatch,
							`Screenshot mismatch of ${actualMatch}% should be less than ${mismatch}%`
						);

						const actualSizeDifference = data.isSameDimensions ?
							0 :
							Math.abs(data.dimensionDifference.width) +
							Math.abs(data.dimensionDifference.height);

						assert.isAtMost(
							actualSizeDifference,
							sizeDifferenceThreshold,
							`Screenshot size difference of ${actualSizeDifference}px should be less than ${sizeDifferenceThreshold}px`
						);
						done();
					});

			});

		});
	}

});
