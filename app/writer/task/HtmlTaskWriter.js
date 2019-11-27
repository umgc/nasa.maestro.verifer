'use strict';

const fs = require('fs');
const path = require('path');

const getImageFileDimensions = require('image-size');
const nunjucks = require('../../helpers/nunjucks');
const consoleHelper = require('../../helpers/consoleHelper');
const TaskWriter = require('./TaskWriter');
const TextTransform = require('../TextTransform');

module.exports = class HtmlTaskWriter extends TaskWriter {

	constructor(task, procedureWriter) {
		super(task, procedureWriter);
		this.textTransform = new TextTransform('html');
		// this.taskNumbering = null;
		// this.getNumbering();
	}

	addImages(images) {

		const imageHtmlArray = [];
		const imagesPath = this.procedureWriter.program.imagesPath;
		const buildPath = this.procedureWriter.program.outputPath;
		for (const imageMeta of images) {

			const imageSrcPath = path.join(imagesPath, imageMeta.path);
			const imageBuildPath = path.join(buildPath, imageMeta.path);
			const imageSize = this.scaleImage(
				getImageFileDimensions(imageSrcPath),
				imageMeta
			);

			// copy image from ./images to ./build
			// Do this asynchronously...no need to wait
			// Also, super lazy: if the image already exists don't copy it again
			if (!fs.existsSync(imageBuildPath)) {
				fs.copyFile(imageSrcPath, imageBuildPath, (err) => {
					if (err) {
						// for now don't throw errors on this. Allow build to finish
						consoleHelper.warn(err);
					}
					consoleHelper.success(`Image ${imageMeta.path} transferred to build directory`);
				});
			}

			const image = nunjucks.render('image.html', {
				path: imageMeta.path,
				width: imageSize.width,
				height: imageSize.height
			});

			imageHtmlArray.push(image);
		}

		return imageHtmlArray;
	}

	addParagraph(params = {}) {
		if (!params.text) {
			params.text = '';
		}
		return `<p>${params.text}</p>`;
	}

	addBlock(blockType, blockLines) {

		const blockTable = nunjucks.render('block-table.html', {
			blockType: blockType,
			blockLines: blockLines.map((line) => {
				return this.textTransform.transform(line).join('');
			})
		});

		return blockTable;
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

		// added class li-level-${options.level} really just as a way to remind that
		// some handling of this will be necessary
		return nunjucks.render('step-text.html', {
			level: options.level,
			actorText,
			stepText: this.textTransform.transform(stepText).join('')
		});
	}

	addCheckStepText(stepText, level, parent) {
		return nunjucks.render('checkbox-step-text.html', {
			parent,
			stepText: this.textTransform.transform(stepText).join(''),
			level
		});
	}

	addTitleText(step) {
		const subtaskTitle = nunjucks.render('subtask-title.html', {
			title: step.title.toUpperCase().trim(),
			duration: step.duration.format('H:M')
		});

		return subtaskTitle;
	}

	preInsertSteps(level) {
		let start;
		if (!level || level === 0) {
			start = `start="${this.stepNumber}"`;
		} else {
			start = '';
		}
		return `<ol ${start}>`;
	}

	postInsertSteps(level) { // eslint-disable-line no-unused-vars
		return '</ol>';
	}

};
