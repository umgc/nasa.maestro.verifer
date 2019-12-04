/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const path = require('path');
const assert = require('chai').assert;

const puppeteer = require('puppeteer');
const resemble = require('node-resemble-js');

const Procedure = require('../app/model/Procedure');

const EvaHtmlProcedureWriter = require('../app/writer/procedure/EvaHtmlProcedureWriter');

describe('EvaHtmlProcedureWriter', function() {
	const procedure = new Procedure();
	const procedureFile = path.join(__dirname, 'cases/simple/procedures/proc.yml');

	const err = procedure.populateFromFile(procedureFile);
	if (err) {
		throw new Error(err);
	}
	// const procedureClone = clonedeep(procedure);

	const buildDir = path.join(procedureFile, '../../build');
	const htmlPath = path.join(buildDir, `${procedure.filename}.html`);
	const expectedPath = path.join(buildDir, `${procedure.filename}.html.jpg`);
	const testPath = path.join(buildDir, `test${procedure.filename}.html.jpg`);

	const procWriter = new EvaHtmlProcedureWriter({}, procedure);
	procWriter.renderIntro();
	procWriter.renderTasks();
	procWriter.writeFile(htmlPath);

	describe('compare full-page screenshot', function() {

		before(async function() {
			this.timeout(10000);

			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.goto(`file://${htmlPath}`);

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

			// Screenshots must match within % below.
			// Ideally this would be an exact match or something really low like 0.01%, but due to
			// apparent difference between generating screenshots on Windows vs Linux (or desktop vs
			// Travis CI) an exact match doesn't appear possible.
			const mismatchThreshold = 1.99;

			resemble(expectedPath).compareTo(testPath).onComplete(function(data) {
				const actualMatch = parseFloat(data.misMatchPercentage);
				assert.isAtMost(
					actualMatch,
					mismatchThreshold,
					`Screenshot mismatch of ${actualMatch}% should be less than ${mismatchThreshold}%`
				);
				done();
			});

		});

	});

});
