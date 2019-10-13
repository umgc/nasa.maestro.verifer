'use strict';

const docx = require('docx');
const DocxTaskWriter = require('./DocxTaskWriter');
const EvaDivisionWriter = require('./EvaDivisionWriter');

module.exports = class EvaDocxTaskWriter extends DocxTaskWriter {

	constructor(task, procedureWriter) {
		super(task, procedureWriter);

		this.taskColumns = task.getColumns(task); // FIXME no need to pass task into getColumns

		this.numCols = this.taskColumns.length;
		this.numContentRows = task.concurrentSteps.length;
		this.numRows = this.numContentRows + 1;

		this.divisionIndex = 0;
	}

	setTaskTableHeader() {

		const columnKeys = this.task.getColumns();

		if (columnKeys.length !== this.numCols) {
			throw new Error('header column text array does not match number of table columns');
		}

		const tableCells = Array(this.numCols).fill(0).map((val, index) => {
			return new docx.TableCell({
				children: [new docx.Paragraph({
					text: this.procedure.columnToDisplay[columnKeys[index]],
					alignment: docx.AlignmentType.CENTER,
					style: 'strong'
				})]
			});
		});

		this.divisionIndex++;

		return new docx.TableRow({
			children: tableCells,
			tableHeader: true
		});

	}

	writeDivision(division) {
		const divWriter = new EvaDivisionWriter();

		const columns = divWriter.prepareDivision(
			division, this
		);

		const borders = {
			top: {
				style: docx.BorderStyle.SINGLE,
				size: 1,
				color: 'AAAAAA'
			}
		};
		if (this.divisionIndex !== this.numRows - 1) {
			borders.bottom = {
				style: docx.BorderStyle.SINGLE,
				size: 1,
				color: 'AAAAAA'
			};
		}

		const rowChildren = [];
		for (let c = 0; c < this.numCols; c++) {
			if (!columns[c]) {
				rowChildren.push(new docx.TableCell({
					children: [],
					columnSpan: 1,
					verticalAlign: docx.VerticalAlign.TOP,
					borders: borders
				}));
				continue;
			}
			rowChildren.push(new docx.TableCell({
				children: columns[c].children,
				columnSpan: columns[c].colspan,
				verticalAlign: docx.VerticalAlign.TOP,
				borders: borders
			}));
			if (columns[c].colspan > 1) {
				c += columns[c].colspan - 1;
			}
		}
		const tableRow = new docx.TableRow({
			children: rowChildren,
			cantSplit: true
		});

		this.divisionIndex++;

		// return it as an array of table rows for future expansion and to make similar to other
		// divisionWriter() methods.
		return [tableRow];
	}

	writeSeries(series, columnKeys) {
		const steps = [];
		this.preInsertSteps();
		for (const step of series) {
			step.columnKeys = Array.isArray(columnKeys) ? columnKeys : [columnKeys];
			steps.push(...this.insertStep(step));
		}
		this.postInsertSteps();
		return steps;
	}

	alterStepParagraphOptions(paraOptions, options) {

		if (options.actors.length > 0) {
			const actorToColumnIntersect = options.actors.filter((value) => {
				return options.columnKeys.includes(value);
			});
			const isPrimeActor = actorToColumnIntersect.length > 0;

			if (!isPrimeActor) {
				paraOptions.children.push(new docx.TextRun({
					text: options.actors[0] + ': ',
					bold: true
				}));
			}
		}

		return paraOptions;
	}

};
