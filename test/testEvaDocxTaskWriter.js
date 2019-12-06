/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const path = require('path');
const assert = require('chai').assert;
const docx = require('docx');

const CommanderProgram = require('../app/model/CommanderProgram');
const Procedure = require('../app/model/Procedure');

const EvaDocxProcedureWriter = require('../app/writer/procedure/EvaDocxProcedureWriter');
const EvaDocxTaskWriter = require('../app/writer/task/EvaDocxTaskWriter');

describe('EvaDocxTaskWriter', function() {
	const procedure = new Procedure();
	const procedureFile = path.join(__dirname, 'cases/simple/procedures/proc.yml');

	const err = procedure.addProcedureDefinitionFromFile(procedureFile);
	if (err) {
		throw new Error(err);
	}

	const procWriter = new EvaDocxProcedureWriter(new CommanderProgram(), procedure);
	const taskWriter = new EvaDocxTaskWriter(
		procedure.tasks[0],
		procWriter
	);

	describe('constructor', function() {
		it('should have correct task columns', function() {
			assert.deepEqual(taskWriter.taskColumns, ['IV', 'EV1', 'EV3']);
		});
		it('should have correct number of rows', function() {
			assert.equal(taskWriter.numContentRows, 8);
			assert.equal(taskWriter.numRows, 9);
		});
	});

	describe('setTaskTableHeader()', function() {

		it('should build a standard header', function() {
			const header = taskWriter.setTaskTableHeader();
			// console.log(header.root[1]);
			assert.instanceOf(header, docx.TableRow);

			assert.instanceOf(header.root[1], docx.TableCell);
			assert.instanceOf(header.root[2], docx.TableCell);
			assert.instanceOf(header.root[3], docx.TableCell);

			assert.instanceOf(header.root[1].root[1], docx.Paragraph);
			assert.instanceOf(header.root[1].root[1].root[1], docx.TextRun);
			assert.equal(header.root[1].root[1].root[1].root[1].constructor.name, 'Text');
			assert.equal(header.root[1].root[1].root[1].root[1].root[1], 'IV/SSRMS');

			assert.instanceOf(header.root[2].root[1], docx.Paragraph);
			assert.instanceOf(header.root[2].root[1].root[1], docx.TextRun);
			assert.equal(header.root[2].root[1].root[1].root[1].constructor.name, 'Text');
			assert.equal(header.root[2].root[1].root[1].root[1].root[1], 'EV1 (Drew)');

			assert.instanceOf(header.root[3].root[1], docx.Paragraph);
			assert.instanceOf(header.root[3].root[1].root[1], docx.TextRun);
			assert.equal(header.root[3].root[1].root[1].root[1].constructor.name, 'Text');
			assert.equal(header.root[3].root[1].root[1].root[1].root[1], 'EV3 (Taz)');
		});
	});

	describe('writeDivision()', function() {
		const division0 = taskWriter.writeDivision(taskWriter.task.concurrentSteps[0]);
		const division4 = taskWriter.writeDivision(taskWriter.task.concurrentSteps[4]);
		const division5 = taskWriter.writeDivision(taskWriter.task.concurrentSteps[5]);

		it('should be a single element array', function() {
			assert.lengthOf(division0, 1);
			assert.lengthOf(division4, 1);
			assert.lengthOf(division5, 1);
		});

		it('should include three columns for a three column task', function() {
			assert.instanceOf(division0[0], docx.TableRow);
			assert.instanceOf(division0[0].root[1], docx.TableCell);
			assert.instanceOf(division0[0].root[2], docx.TableCell);
			assert.instanceOf(division0[0].root[3], docx.TableCell);

			// first division is EV1 only, so IV column empty
			assert.isUndefined(division0[0].root[1].root[1]);

			// first division has two steps on EV1, so should have two paragraphs in EV1 column
			assert.instanceOf(division0[0].root[2].root[1], docx.Paragraph);
			assert.instanceOf(division0[0].root[2].root[2], docx.Paragraph);

			// first division is EV1 only, so EV3 column empty
			assert.isUndefined(division0[0].root[3].root[1]);
		});

		it('should include a merged column on joint actors', function() {
			assert.instanceOf(division5[0], docx.TableRow);
			assert.instanceOf(division5[0].root[1], docx.TableCell); // IV column
			assert.instanceOf(division5[0].root[2], docx.TableCell); // EV1 + EV3 column
			assert.isUndefined(division5[0].root[3]); // no third column since EV1 and EV3 merged
		});
	});

	describe('writeSeries()', function() {
		it('should handle series sourced from non-simo blocks', function() {
			const series = taskWriter.writeSeries(taskWriter.task.concurrentSteps[2].IV, ['IV']);
			assert.instanceOf(series[0], docx.Paragraph);
			assert.instanceOf(series[0].root[1], docx.TextRun);
			assert.equal(series[0].root[1].root[1].constructor.name, 'Text');
			assert.equal(series[0].root[1].root[1].root[1], 'step 3');
		});

		it('should handle series sourced from role variables', function() {
			const series = taskWriter.writeSeries(taskWriter.task.concurrentSteps[0].EV1, ['EV1']);

			// step 1
			assert.instanceOf(series[0], docx.Paragraph);
			assert.instanceOf(series[0].root[1], docx.TextRun);
			assert.equal(series[0].root[1].root[1].constructor.name, 'Text');
			assert.equal(series[0].root[1].root[1].root[1], 'step 1');

			// step 1a
			assert.instanceOf(series[1], docx.Paragraph);
			assert.instanceOf(series[1].root[1], docx.TextRun);
			assert.equal(series[1].root[1].root[1].constructor.name, 'Text');
			assert.equal(series[1].root[1].root[1].root[1], 'step 1a');
		});

		it('should handle series sourced from simo blocks', function() {
			const series = taskWriter.writeSeries(taskWriter.task.concurrentSteps[3].IV, ['IV']);
			assert.instanceOf(series[0], docx.Paragraph);
			assert.instanceOf(series[0].root[1], docx.TextRun);
			assert.equal(series[0].root[1].root[1].constructor.name, 'Text');
			assert.equal(series[0].root[1].root[1].root[1], 'step 4');
		});

		it('should accept columnKeys as strings', function() {
			const series = taskWriter.writeSeries(taskWriter.task.concurrentSteps[3].IV, 'IV');
			assert.instanceOf(series[0], docx.Paragraph);
			assert.instanceOf(series[0].root[1], docx.TextRun);
			assert.equal(series[0].root[1].root[1].constructor.name, 'Text');
			assert.equal(series[0].root[1].root[1].root[1], 'step 4');
		});

		it('should apply actor prefixes if columnKeys don\'t match actors', function() {
			const series = taskWriter.writeSeries(taskWriter.task.concurrentSteps[3].IV, 'NOT-IV');
			assert.instanceOf(series[0], docx.Paragraph);

			// create a bold "IV: " TextRun since actor "IV" not in column "NOT-IV"
			assert.instanceOf(series[0].root[1], docx.TextRun);
			assert.equal(series[0].root[1].root[1].constructor.name, 'Text');
			assert.equal(series[0].root[1].root[1].root[1], 'IV: ');

			// then follow that TextRun with the step text
			assert.instanceOf(series[0].root[2], docx.TextRun);
			assert.equal(series[0].root[2].root[1].constructor.name, 'Text');
			assert.equal(series[0].root[2].root[1].root[1], 'step 4');
		});

		it('should handle joint actor series', function() {
			// console.log(taskWriter.task.concurrentSteps[5]);
			const series = taskWriter.writeSeries(taskWriter.task.concurrentSteps[5]['EV1 + EV3'], ['EV1 + EV3', 'EV1', 'EV3']);

			// step 9
			assert.instanceOf(series[0], docx.Paragraph);
			assert.instanceOf(series[0].root[1], docx.TextRun);
			assert.equal(series[0].root[1].root[1].constructor.name, 'Text');
			assert.equal(series[0].root[1].root[1].root[1], 'step 9');

			// step 10
			assert.instanceOf(series[1], docx.Paragraph);
			assert.instanceOf(series[1].root[1], docx.TextRun);
			assert.equal(series[1].root[1].root[1].constructor.name, 'Text');
			assert.equal(series[1].root[1].root[1].root[1], 'step 10');
		});
	});

	describe('alterStepParagraphOptions()', function() {

		const paraOptions = { children: [] };

		// if there's no actor, what would you prefix it with?
		// if there's no column key, how do you know if the actor should be prefixed?
		describe('don\'t add prefix if actors or columnKeys empty', function() {
			for (const actors of [[], ['A'], ['A', 'B', 'C']]) {
				for (const colKeys of [[], ['one'], ['one', 'two', 'three']]) {
					if (actors.length > 0 && colKeys.length > 0) {
						// in this 'describe' only testing case where actor or columnKey is missing
						continue;
					}
					it(
						`should not prefix text with actors=${JSON.stringify(actors)} and columnKeys=${JSON.stringify(colKeys)}`,
						function() {
							assert.deepEqual(
								taskWriter.alterStepParagraphOptions(
									paraOptions,
									{ actors: actors, columnKeys: colKeys }
								),
								paraOptions
							);
						}
					);
				}
			}
		});

		// actor performing a step within a column that it is not a named actor: add prefix
		describe('add prefix when actors and column keys present but don\'t match', function() {
			for (const actors of [['A'], ['A', 'B', 'C']]) {
				for (const colKeys of [['one'], ['one', 'two', 'three']]) {
					it(
						`should prefix text with actors=${JSON.stringify(actors)} and columnKeys=${JSON.stringify(colKeys)}`,
						function() {
							assert.deepEqual(
								taskWriter.alterStepParagraphOptions(
									paraOptions,
									{ actors: actors, columnKeys: colKeys }
								),
								{
									children: [new docx.TextRun({
										text: 'A: ',
										bold: true
									})]
								}
							);
						}
					);
				}
			}
		});

		// actors peforming steps within columns they own: don't prefix
		describe('don\'t add prefix when actor(s) match column key(s)', function() {
			for (const actors of [['one'], ['one', 'three', 'four']]) {
				for (const colKeys of [['one'], ['one', 'two', 'three']]) {
					it(
						`should not prefix text with actors=${JSON.stringify(actors)} and columnKeys=${JSON.stringify(colKeys)}`,
						function() {
							assert.deepEqual(
								taskWriter.alterStepParagraphOptions(
									paraOptions,
									{ actors: actors, columnKeys: colKeys }
								),
								paraOptions
							);
						}
					);
				}
			}
		});
	});
});
