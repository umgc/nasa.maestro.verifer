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

			resemble(expectedPath).compareTo(testPath).onComplete(function(data) {
				console.log(typeof data.misMatchPercentage);
				assert.isAtMost(
					parseFloat(data.misMatchPercentage),
					0.01,
					'Screenshot should match'
				);
				done();
			});

		});

	});

	/*
	describe('renderIntro()', function() {
		it('should render valid HTML', function() {
			assert.isNumber(procWriter.getRightTabPosition());
			assert.equal(procWriter.getRightTabPosition() % 1, 0); // integer test
		});
	});

	describe('renderTask()', function() {
		const renderedTask = procWriter.renderTask(procWriter.procedure.tasks[0]);

		it('should have required keys', function() {
			assert.hasAllKeys(renderedTask, ['headers', 'footers', 'size', 'margins', 'children']);
		});

		it('should have only a deafult docx header and footer', function() {
			assert.instanceOf(renderedTask.headers.default, docx.Header);
			assert.hasAllKeys(renderedTask.headers, 'default');
			assert.instanceOf(renderedTask.footers.default, docx.Footer);
			assert.hasAllKeys(renderedTask.footers, 'default');
		});

		it('should have a size and margins object', function() {
			assert.isObject(renderedTask.size);
			assert.isObject(renderedTask.margins);
		});

		it('should have a single-element array of children with a docx.Table', function() {
			assert.isArray(renderedTask.children);
			assert.lengthOf(renderedTask.children, 1);
			assert.instanceOf(renderedTask.children[0], docx.Table);
		});

		it('should have 8 docx.TableRow objects', function() {
			let tableRowCount = 0;
			for (const elem of renderedTask.children[0].root) {
				if (elem instanceof docx.TableRow) {
					tableRowCount++;
				}
			}

			// number of rows in ./test/cases/simple/tasks/egress.yml, plus a header
			assert.equal(tableRowCount, 9);
		});

		it('should not modify procedure object', function() {
			assert.deepEqual(procedure, procedureClone);
		});

	});
	*/

});
