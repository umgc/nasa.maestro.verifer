/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const path = require('path');
const assert = require('chai').assert;
const docx = require('docx');
const clonedeep = require('lodash/cloneDeep');

const CommanderProgram = require('../../model/CommanderProgram');
const Procedure = require('../../model/Procedure');

const EvaDocxProcedureWriter = require('./EvaDocxProcedureWriter');

describe('EvaDocxProcedureWriter', function() {
	const procedure = new Procedure();
	const procedureFile = path.join(__dirname, '../../../test/cases/simple/procedures/proc.yml');

	const err = procedure.addProcedureDefinitionFromFile(procedureFile);
	if (err) {
		throw new Error(err);
	}
	const procedureClone = clonedeep(procedure);

	const procWriter = new EvaDocxProcedureWriter(new CommanderProgram(), procedure);

	describe('constructor', function() {

		it('should set default values', function() {
			assert.isNumber(procWriter.initialIndent);
			assert.isNumber(procWriter.indentStep);
			assert.isNumber(procWriter.hanging);
		});

		it('should define numbering level types', function() {
			assert.isArray(procWriter.levelTypes);
			assert.isTrue(procWriter.levelTypes.length > 4);
			assert.isArray(procWriter.levels);
		});

		it('should create a new docx document', function() {
			assert.instanceOf(procWriter.doc, docx.Document);
		});
	});

	describe('getRightTabPosition()', function() {
		it('should return an integer', function() {
			assert.isNumber(procWriter.getRightTabPosition());
			assert.equal(procWriter.getRightTabPosition() % 1, 0); // integer test
		});
	});

	describe('getPageSize()', function() {
		const pageSize = procWriter.getPageSize();
		it('should return an object of correct form', function() {
			assert.isObject(pageSize);
			assert.hasAllKeys(pageSize, ['width', 'height', 'orientation']);
		});

		it('should have an integer width and height', function() {
			assert.isNumber(pageSize.width);
			assert.equal(pageSize.width % 1, 0); // integer test
			assert.isNumber(pageSize.height);
			assert.equal(pageSize.height % 1, 0); // integer test
		});

		it('should have an orientation of docx.PageOrientation', function() {
			assert.isString(pageSize.orientation);
			assert.oneOf(pageSize.orientation, ['landscape', 'portrait']);
		});
	});

	describe('getPageMargins()', function() {
		const pageMargins = procWriter.getPageMargins();
		const types = ['top', 'right', 'bottom', 'left'];
		it('should return an object of correct form', function() {
			assert.isObject(pageMargins);
			assert.hasAllKeys(pageMargins, types);
		});

		it('should have an integer values only', function() {
			for (const type of types) {
				assert.isNumber(pageMargins[type]);
				assert.equal(pageMargins[type] % 1, 0); // integer test
			}
		});
	});

	// Build tests for TimelineWriter first
	// describe('renderIntro()', function() {
	// });

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

});
