'use strict';

const fs = require('fs');
const svg2img = require('svg2img');
const lodashFlatten = require('lodash/flatten');
const objectHelper = require('../../helpers/objectHelper');

function addBox(canvas, opts = {}) {
	objectHelper.requireProps(opts, ['width', 'height', 'x', 'y']);
	objectHelper.defaults(opts, {
		stroke: '#000',
		fillColor: '#000'
	});

	canvas
		.rect(opts.width, opts.height)
		.stroke(opts.stroke)
		.move(opts.x, opts.y)
		.fill(opts.fillColor);
}

function addText(canvas, opts, textFn) {
	objectHelper.defaults(opts, {
		text: '<placeholder text>',
		x: 0,
		y: 0,
		color: '#000',
		family: 'Arial',
		size: 12,
		weight: 'normal',
		anchor: 'start',
		leading: 1.3
	});

	const text = textFn || opts.text;

	// Add the text to the canvas
	canvas
		.text(text)
		.move(opts.x, opts.y)
		.font({
			fill: opts.color,
			family: opts.family,
			size: opts.size,
			weight: opts.weight,
			anchor: opts.anchor,
			leading: opts.leading
		});

}

/**
 * Get x-coordinate of the left edge of a column in pixels
 * @param {TimelineWriter} writer  Instance of TimelineWriter
 * @param {number} columnIndex     Index of the column
 * @return {number}             Pixels of the left edge of the column
 */
function getColumnLeft(writer, columnIndex) {
	return writer.sidebarWidth + columnIndex * writer.colWidth;
}

function addActivity(writer, columnIndex, task, actor) {

	const canvas = writer.canvas;

	const boxOpts = {
		width: writer.colWidth,
		height: writer.minutesToPixels(task.actorRolesDict[actor].duration.getTotalMinutes()),
		x: getColumnLeft(writer, columnIndex),
		y: writer.headerRowY + writer.minutesToPixels(
			task.actorRolesDict[actor].startTime.getTotalMinutes()
		)
	};
	boxOpts.stroke = '#000';
	boxOpts.fillColor = task.color || '#F0FFFF';

	addBox(canvas, boxOpts);

	const textOpts = {
		x: boxOpts.x + writer.leftTextMargin,
		y: boxOpts.y + writer.topTextMargin,
		color: '#000',
		family: 'Arial',
		size: 12 // potentially adjusted smaller below logic below
	};

	if (boxOpts.height < 16) {
		textOpts.size = 8;
	} else if (boxOpts.height < 22) {
		textOpts.y = textOpts.y - 6; // box getting too short, make more room
	}

	addText(canvas, textOpts, function(add) {
		if (boxOpts.height > 10) {
			// todo Add underline here
			// todo ref: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-decoration
			// todo unknown if current SVG library supports underline
			add.tspan(task.title.toUpperCase());
			add.tspan(` (${task.actorRolesDict[actor].duration.format('H:M')})`);
		}
	});

}

function addColumnHeader(writer, columnIndex, headerText) {

	const canvas = writer.canvas;
	const xLeft = getColumnLeft(writer, columnIndex);

	const boxOpts = {
		width: writer.colWidth,
		height: writer.headerRowY,
		x: xLeft,
		y: 0,
		stroke: '#000',
		fillColor: 'white'
	};

	addBox(canvas, boxOpts);

	const textOpts = {
		text: headerText.toUpperCase(),
		x: xLeft + writer.leftTextMargin + Math.floor(writer.colWidth / 2),
		y: Math.floor((writer.headerRowY - writer.headerTextSize) / 2),
		color: '#000',
		family: 'Arial',
		size: writer.headerTextSize,
		weight: 'bold',
		anchor: 'middle',
		leading: 0
	};

	addText(canvas, textOpts);

}

function addTimelineMarkings(writer) {

	const canvas = writer.canvas;

	// how many half-hour segments to generate
	const halfHours = Math.ceil(writer.totalMinutes / 30);

	for (let i = 0; i <= halfHours; i++) {

		const isHour = (i % 2) === 0;

		// eslint-disable-next-line no-restricted-properties
		const hours = Math.floor(i / 2).toString().padStart(2, '0');
		const minutes = isHour ? ':00' : ':30';
		const timeString = hours + minutes;

		// line sticks out further from sidebar on hours than on half-hours
		const tickLength = isHour ? writer.tickLengthMajor : writer.tickLengthMinor;

		// start and end coordinates for each line
		const y = writer.headerRowY + writer.minutesToPixels(i * 30);
		const rightX = writer.sidebarWidth + (writer.numColumns * writer.colWidth) + tickLength;
		const leftX = writer.sidebarWidth - tickLength;

		// draws a line across the whole timeline, from left sidebar to right sidebar
		canvas
			.line(leftX, y, rightX, y)
			.stroke({
				width: 1,
				color: 'black'
			});

		const textOptions = {
			text: timeString,
			x: 5,
			y: y - 3,
			fill: 'black',
			family: 'Arial',
			size: 11,
			leading: -1
		};

		// left sidebar marking text
		addText(canvas, textOptions);

		// right sidebar marking text
		textOptions.x = writer.imageWidth - 28; // same text, just shift the x coordinate
		addText(canvas, textOptions);

	}

}

/**
 * Set optional values or defaults
 * @param {TimelineWriter} writer  Set options or defaults on this TimelineWriter object
 * @param {Object} options         Options to override defaults
 */
function handleOptions(writer, options) {
	writer.maxWidth = options.maxWidth || 950;
	writer.maxHeight = options.maxHeight || 660;
	writer.sidebarWidth = options.sidebarWidth || 50;
	writer.leftTextMargin = options.leftTextMargin || 5;
	writer.topTextMargin = options.topTextMargin || 0;
	writer.headerRowY = options.headerRowY || 25;
	writer.headerTextSize = options.headerTextSize || 16;
	writer.tickLengthMajor = options.tickLengthMajor || 10;
	writer.tickLengthMinor = options.tickLengthMinor || 5;
	writer.bottomPadding = options.bottomPadding || 5;
}

module.exports = class TimelineWriter {

	/**
	 * Construct TimelineWriter object
	 * @param  {Procedure} procedure  Procedure object
	 * @param  {Object} options       Options like {maxHeight: 300, colWidth: 100}
	 */
	constructor(procedure, options = {}) {

		this.procedure = procedure;
		this.totalMinutes = procedure.getActualDuration().getTotalMinutes();
		handleOptions(this, options);

		/**
		 * procedure.getColumnsOfActorsFillingRoles() returns 2D array like:
		 *   [['SSRMS', 'IV'], ['EV1', 'CRONUS'], 'EV2']
		 *~
		 * Flatten to:
		 *   [ 'SSRMS', 'IV', 'EV1', 'CRONUS', 'EV2']
		 *
		 * Eventually use Array.prototype.flat(), but that's ES2019+. For backwards compat use
		 * lodash.flatten()
		 */
		this.columns = lodashFlatten(
			procedure.getColumnsOfActorsFillingRoles(false)
		);

		/**
		 * Create map of actor to column index, e.g.:
		 *   actorToTimelineColumn = {
		 *     EV1: 0,
		 *     EV2: 1
		 *   }
		 * This means EV1 is in the index=0 column and EV2 is in the index=1 column
		 */
		this.actorToTimelineColumn = {};
		this.columns.forEach((actor, index) => {
			this.actorToTimelineColumn[actor] = index;
		});

		this.numColumns = this.columns.length;
		this.colWidth = Math.floor((this.maxWidth - (2 * this.sidebarWidth)) / this.numColumns);

		// Duration rounded up to the nearest half hour, so last tick-mark and time shows on sidebar
		const roundMinutesUpToHalfHour = Math.ceil(this.totalMinutes / 30) * 30;

		this.imageHeight = this.maxHeight;

		// bottomPadding gives room for text below line
		const contentHeight = this.imageHeight - this.headerRowY - this.bottomPadding;

		// Create a conversion factor for minutes to pixels, minutesToPixels(). If we want to scale
		// 10 minutes to 200 pixels, then we want to be able to say "how many pixels should 1 minute
		// be?" This is answered by minutes * conversionFactor = pixels. To get the conversion
		// factor we take the total number of minutes and the total content size.
		this.conversionFactor = contentHeight / roundMinutesUpToHalfHour;

		this.imageWidth = (2 * this.sidebarWidth) + (this.numColumns * this.colWidth);
	}

	/**
	 * Generate the actual timeline SVG. This is broken into its own function rather than being done
	 * in the constructor because the construct will likely be generalized for multiple timeline
	 * formats, not just SVG, but the code below is SVG-specific.
	 *
	 * @return {string} SVG's XML
	 */
	create() {

		// svgdom returns 'new Window()'. We don't want to get a reference to the same Window object
		// on all uses. We want a new window each time. Get the Window constructor and construct our
		// own new Window.
		const WindowConstructor = require('svgdom').constructor;
		const window = new WindowConstructor();

		// When SVG timeline extends generic timeline, move this to top of file
		const document = window.document;
		const { SVG, registerWindow } = require('@svgdotjs/svg.js');

		// register window and document
		registerWindow(window, document);

		// create canvas
		this.canvas = SVG(document.documentElement).size(this.imageWidth, this.imageHeight);

		// Create the underlying lines and text for the timeline (not tasks themselves)
		addTimelineMarkings(this);

		// Create the headers for each column
		this.columns.forEach((actor, index) => {
			const headerDisplay = this.procedure.getColumnHeaderTextByActor(actor);
			addColumnHeader(this, index, headerDisplay);
		});

		// Add tasks to the timeline
		for (const task of this.procedure.tasks) {
			for (const actor in task.actorRolesDict) {
				const columnIndex = this.actorToTimelineColumn[actor];
				addActivity(this, columnIndex, task, actor);
			}
		}

		return this.canvas.svg();
	}

	writeSVG(filename) {
		fs.writeFileSync(filename, this.canvas.svg());
	}

	writePNG(filename, callback) {
		const dimensions = {
			width: this.imageWidth,
			height: this.imageHeight,
			preserveAspectRatio: true
		};
		svg2img(
			this.canvas.svg(),
			dimensions,
			function(error, buffer) {
				if (error) {
					throw error;
				}
				fs.writeFileSync(filename, buffer);
				callback(dimensions);
			}
		);
	}

	/**
	 * Scale a number of minutes to pixels
	 * @param {number} minutes         Number of minutes
	 * @return {number}                Number of pixels
	 */
	minutesToPixels(minutes) {
		return Math.floor(this.conversionFactor * minutes);
	}

};
