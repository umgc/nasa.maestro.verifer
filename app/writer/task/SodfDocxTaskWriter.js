'use strict';

const docx = require('docx');
const DocxTaskWriter = require('./DocxTaskWriter');

module.exports = class SodfDocxTaskWriter extends DocxTaskWriter {

	/**
	 * Using a ConcurrentStep, write a division.
	 * @param {ConcurrentStep} division    ConcurrentStep object
	 * @return {Array}                     Array of docx.TableRow objects
	 */
	writeDivision(division) {
		const docxTableRows = [];

		let hopper = [];

		for (const actor in division) {
			// actor, location, [stepParagraphs]
			const series = this.writeSeries(division[actor]);
			for (const stepInfo of series) {
				const lastActor = this.procedure.lastActor;
				const lastLocation = this.procedure.lastLocation;

				if (lastActor !== stepInfo.actor || lastLocation !== stepInfo.location) {
					const actorText = lastActor === stepInfo.actor ? '' : lastActor;
					const locationText = lastLocation === stepInfo.location ? '' : lastLocation;
					docxTableRows.push(this.createRow(actorText, locationText, hopper));
					hopper = []; // empty the hopper
				}
				hopper.push(...stepInfo.stepParagraphs);
				this.procedure.lastActor = stepInfo.actor;
				this.procedure.lastLocation = stepInfo.location;
			}
		}
		return docxTableRows;
	}

	/**
	 * Write a table row for an actor+location combination. Anytime actor or location changes a new
	 * row will be created, and only the value that changed will be passed in. So if actor changes
	 * but location stays the same, then location will be an empty string.
	 * @param {string} actor            Actor performing step or empty string
	 * @param {string} location         Location step is performed or empty string
	 * @param {Array} stepParagraphs    Array of docx.Paragraph or similar objects
	 * @return {TableRow}               docx.TableRow object
	 */
	createRow(actor, location, stepParagraphs) {

		const borderValues = {
			style: docx.BorderStyle.NONE,
			size: 0,
			color: 'FFFFFF'
		};
		const borders = {
			top: borderValues,
			bottom: borderValues,
			left: borderValues,
			right: borderValues
		};

		return new docx.TableRow({
			children: [
				new docx.TableCell({
					children: [new docx.Paragraph({ text: actor })],
					verticalAlign: docx.VerticalAlign.TOP,
					borders: borders
				}),
				new docx.TableCell({
					children: [new docx.Paragraph({ text: location })],
					verticalAlign: docx.VerticalAlign.TOP,
					borders: borders
				}),
				new docx.TableCell({
					children: stepParagraphs,
					verticalAlign: docx.VerticalAlign.TOP,
					borders: borders
				})
			]
		});
	}

	writeSeries(series) {
		const steps = [];
		this.preInsertSteps();
		for (const step of series) {
			const actor = step.actors[0];
			const location = step.location;
			steps.push({
				actor: actor,
				location: location,
				stepParagraphs: this.insertStep(step)
			});
		}
		this.postInsertSteps();
		return steps;
	}

};
