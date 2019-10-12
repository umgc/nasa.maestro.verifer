'use strict';

const fs = require('fs');
const path = require('path');
const docx = require('docx');

const consoleHelper = require('../../helpers/consoleHelper');

const ProcedureWriter = require('./ProcedureWriter');

module.exports = class DocxProcedureWriter extends ProcedureWriter {

	constructor(program, procedure) {
		super(program, procedure);

		// NOTE: 720 = 1/2 inch
		//       360 = 1/4
		//       180 = 1/8
		//       90  = 1/16
		this.initialIndent = 45;
		this.indentStep = 360;
		// const tabOffset = 360;

		// how far left of the up-pointing arrow the down-pointing arrow should be
		this.hanging = 360;
		this.levelTypes = [
			'decimal',
			'lowerLetter',
			'decimal',
			'lowerLetter',
			'decimal',
			'lowerLetter',
			'decimal',
			'lowerLetter',
			'decimal',
			'lowerLetter'
		];
		this.levels = [];

		const docOptions = this.getDocMeta();
		docOptions.styles = {
			paragraphStyles: [
				{
					id: 'normal',
					name: 'Normal',
					basedOn: 'Normal',
					next: 'Normal',
					quickFormat: true,
					run: {
						font: 'Arial',
						size: 20
					},
					paragraph: {
						indent: {
							left: 45
						},
						spacing: {
							before: 45,
							after: 0
						}
					}

				},
				{
					id: 'listparagraph',
					name: 'List Paragraph',
					basedOn: 'List Paragraph',
					next: 'List Paragraph',
					quickFormat: true,
					run: {
						font: 'Arial',
						size: 20
					},
					paragraph: {
						spacing: {
							before: 45,
							after: 0
						}
					}
				},
				{
					id: 'strong',
					name: 'Strong',
					basedOn: 'Normal',
					next: 'Normal',
					quickFormat: true,
					run: {
						font: 'Arial',
						size: 20,
						bold: true
					},
					paragraph: {
						spacing: {
							before: 45,
							after: 0
						}
					}
				}
			]
		};

		this.doc = new docx.Document(docOptions);
	}

	/**
	 * [getIndents description]
	 *
	 * @param  {int} levelIndex How far indented? Top level list is 0, first
	 *                          sub-list is 1, next is 2, and so on.
	 * @return {Object} Indent object like { left: INT, tab: INT, hanging: INT }
	 */
	getIndents(levelIndex) {
		const left = this.initialIndent + (levelIndex * this.indentStep) + this.hanging;
		const tab = left;
		const output = {
			left: left,
			tab: tab,
			hanging: this.hanging
		};
		return output;
	}

	writeFile(filepath) {
		const relativeFilepath = path.relative(process.cwd(), filepath);

		console.log(`Starting to write ${relativeFilepath}`);
		docx.Packer.toBuffer(this.doc).then((buffer) => {
			fs.writeFileSync(filepath, buffer);
			consoleHelper.success(`SUCCESS: ${relativeFilepath} written!`);
		});
	}

	genHeader(headerText) {

		return new docx.Header({
			children: [new docx.Paragraph({
				children: [new docx.TextRun({
					text: headerText,
					bold: true,
					size: 24, // half-points, so double the point height
					font: {
						name: 'Arial'
					}
				})]
			})]
		});
	}

	genTaskHeader(task) {
		const durationDisplay = this.getTaskDurationDisplay(task);
		return this.genHeader(`${this.procedure.name} - ${task.title} (${durationDisplay})`);
	}

	genFooter() {
		// const procFooter = new docx.Paragraph({ children: [] }).maxRightTabStop();
		// const leftFooterText = new docx.TextRun(
		// ---   "Latest change: " + gitDate + " (Version: " + gitHash + ")");
		// const rightFooterText = new docx.TextRun("Page").tab();
		// procFooter.addRun(leftFooterText);
		// procFooter.addRun(rightFooterText);

		const gitDate = this.getGitDate();
		const gitHash = this.getGitHash();
		const gitUncommitted = this.getGitUncommittedChanges();

		const children = [new docx.TextRun(`${gitDate} (version: ${gitHash})`)];
		if (gitUncommitted) {
			children.push(new docx.TextRun({
				text: ` WARNING: ${gitUncommitted}`,
				color: 'red',
				bold: true
			}));
		}
		children.push(new docx.TextRun('Page ').pageNumber().tab());
		children.push(new docx.TextRun(' of ').numberOfTotalPages());

		const footerParagraph = new docx.Paragraph({
			alignment: docx.AlignmentType.LEFT,
			children: children,
			tabStop: {
				right: { position: this.getRightTabPosition() }
			},
			style: 'normal'
		}); // / .allCaps();

		const procFooter = new docx.Footer({
			children: [footerParagraph]
		});

		return procFooter;
	}

	renderIntro() {
		return '';
	}

	renderOutro() {
		return '';
	}
};
