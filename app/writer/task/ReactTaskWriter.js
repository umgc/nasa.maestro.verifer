'use strict';

const path = require('path');
const React = require('react');

const getImageFileDimensions = require('image-size');
const TextTransform = require('../TextTransform');
const settings = require('../../settings');

const uuidv4 = require('uuid/v4');

const TaskWriter = require('./HtmlTaskWriter');
const EvaDivisionWriter = require('./EvaDivisionWriter');
const filters = require('../../helpers/filters');

module.exports = class ReactTaskWriter extends TaskWriter {

	constructor(task, procedureWriter) {
		super(task, procedureWriter);

		this.taskColumns = task.getColumns();
		this.textTransform = new TextTransform('react');

		this.numCols = this.taskColumns.length;
		this.numContentRows = task.concurrentSteps.length;
		this.numRows = this.numContentRows + 1;
	}

	getTableHeaderCells() {

		const columnKeys = this.task.getColumns();
		const columnNames = [];

		for (const colKey of columnKeys) {
			columnNames.push(this.procedure.columnToDisplay[colKey]);
		}

		return columnNames.map((name) => (
			<th
				key={filters.uniqueHtmlId(`table-header-${name}`)}
				style={{ width: `${100 / columnKeys.length}%` }}
			>
				{name}
			</th>
		));
	}

	// FIXME: duplication from HtmlTaskWriter or something like that
	writeDivision(division) {
		const divWriter = new EvaDivisionWriter();

		const columns = divWriter.prepareDivision(
			division, this
		);

		for (let c = 0; c < this.numCols; c++) {
			if (!columns[c]) {
				columns[c] = {
					content: [],
					colspan: 1
				};
				continue;
			}
			if (columns[c].colspan > 1) {
				c += columns[c].colspan - 1;
			}
		}

		return (
			<tr>
				{Object.keys(columns).map((key) => (
					<td key={uuidv4()} colSpan={columns[key].colspan}>{columns[key].children}</td>
				))}
			</tr>
		);

	}

	writeSeries(series, columnKeys) {
		const steps = [];
		const startStep = this.preInsertSteps();

		for (const step of series) {
			step.columnKeys = Array.isArray(columnKeys) ? columnKeys : [columnKeys];
			steps.push(
				...this.insertStep(step)
			);
		}

		return (<ol start={startStep}>{steps}</ol>);
	}

	/**
	 * ! FIXME Below is heavily ripped off from HtmlTaskWriter
	 */

	addImages(images) {

		const imageHtmlArray = [];
		const imagesPath = this.procedureWriter.program.imagesPath;
		for (const imageMeta of images) {

			const imageSrcPath = path.join(imagesPath, imageMeta.path);
			const imageSize = this.scaleImage(
				getImageFileDimensions(imageSrcPath),
				imageMeta
			);

			const imgPath = settings.htmlImagePrefix + imageMeta.path;

			const image = (
				<a href={imgPath}>
					<img
						className="img-fluid"
						src={imgPath}
						width={imageSize.width}
						height={imageSize.height}
						alt="image"
					/>
				</a>
			);

			imageHtmlArray.push(image);
		}

		return imageHtmlArray;
	}

	addParagraph(params = {}) {
		if (!params.text) {
			params.text = '';
		}
		return (<p>{params.text}</p>);
	}

	addBlock(blockType, blockLines) {

		blockLines = blockLines.map((line) => {
			return this.textTransform.transform(line);
		});

		return (
			<div className="ncw ncw-{{blockType}}">
				<div className="ncw-head">
					{blockType.toUpperCase()}
				</div>
				<div className="ncw-body">
					<ol>
						{Object.keys(blockLines).map((key) => (
							<li key={uuidv4()}>{blockLines[key]}</li>
						))}
					</ol>
				</div>
			</div>
		);
	}

	/**
	 * ! TBD a description
	 * @param {*} stepText        Text to turn into a step
	 * @param {*} options         options = { level: 0, actors: [], columnKey: "" }
	 * @return {string}
	 */
	addStepText(stepText, options = {}) {
		if (!options.level) {
			options.level = 0;
		}
		if (!options.actors) {
			options.actors = [];
		}
		if (!options.columnKeys) {
			options.columnKeys = [];
		}

		let actorText = '';
		if (options.actors.length > 0) {
			const actorToColumnIntersect = options.actors.filter((value) => {
				return options.columnKeys.includes(value);
			});
			const isPrimeActor = actorToColumnIntersect.length > 0;

			if (!isPrimeActor) {
				actorText = options.actors[0];
			}
		}

		return (
			<li className={`li-level-${options.level}`}>
				{ actorText ?
					(<strong>{actorText}: </strong>) :
					(<React.Fragment></React.Fragment>)
				}
				{this.textTransform.transform(stepText)}
			</li>
		);
	}

	addCheckStepText(stepText, level, parent) {
		return (
			<li className={`li-level-${level}`}>
				<label>
					<input
						data-level="step"
						data-parent={parent}
						className="step"
						type="checkbox"
					/>
					{this.textTransform.transform(stepText)}
				</label>
			</li>
		);
	}

	addTitleText(step) {
		return (
			<h3 data-level="subtask">
				<span className="subtask-title">{step.title.toUpperCase().trim()}</span>
				&nbsp;
				<span className="subtask-duration">({step.duration.format('H:M')})</span>
			</h3>
		);
	}

	preInsertSteps(level) {
		if (!level || level === 0) {
			return this.stepNumber;
		} else {
			return undefined;
		}
		// return `<ol ${start}>`;
	}

	// unused
	postInsertSteps(level) { // eslint-disable-line no-unused-vars
		return null; // '</ol>';
	}

	setModuleOutputType() {
		return 'React';
	}

};
