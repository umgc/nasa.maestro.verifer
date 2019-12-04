'use strict';

const HtmlProcedureWriter = require('./HtmlProcedureWriter');
const EvaHtmlTaskWriter = require('../task/EvaHtmlTaskWriter');
const HtmlTimelineWriter = require('../timeline/HtmlTimelineWriter');

module.exports = class EvaHtmlProcedureWriter extends HtmlProcedureWriter {

	constructor(program, procedure) {
		super(program, procedure);
	}

	// implement with CSS
	// getRightTabPosition() {}
	// getPageSize() {}
	// getPageMargins() {}

	renderIntro() {

		const timeline = new HtmlTimelineWriter(this.procedure);
		const html = timeline.create();

		this.content += `<h2>${this.procedure.name} - Summary Timeline</h2>${html}`;

	}

	renderTask(task) {

		const taskWriter = new EvaHtmlTaskWriter(
			task,
			this
		);

		this.content += this.genHeader(task);
		this.content += '<table class="gridtable">';
		this.content += taskWriter.setTaskTableHeader();
		this.content += taskWriter.writeDivisions().join('');
		this.content += '</table>';
		this.content += taskWriter.embedTask(task);

		// this.genFooter() <-- not done in HTML like DOCX
	}
};
