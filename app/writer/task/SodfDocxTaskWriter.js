'use strict';

// const docx = require('docx');
const DocxTaskWriter = require('./DocxTaskWriter');

module.exports = class SodfDocxTaskWriter extends DocxTaskWriter {

	constructor(task, procedureWriter) {
		super(task, procedureWriter);
	}

	writeDivision(division) {
		const steps = [];
		for (const actor in division) {
			// NOTE: aSeries === division[actor]
			steps.push(
				// for now, flatten this series so all the steps are added directly to the section
				...this.writeSeries(division[actor])
			);
		}
		return steps;
	}

	writeSeries(series) {
		const steps = [];
		this.preInsertSteps();
		for (const step of series) {
			steps.push(...this.insertStep(step));
		}
		this.postInsertSteps();
		return steps;
	}

};
