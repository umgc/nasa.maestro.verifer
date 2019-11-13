'use strict';

const fs = require('fs');
const svg2img = require('svg2img');
const lodashFlatten = require('lodash/flatten');

let conversionFactor,
	maxWidth,
	maxHeight,
	colWidth,
	sidebarWidth,
	leftTextMargin,
	topTextMargin,
	totalMinutes,
	headerRowY,
	imageHeight,
	headerTextSize,
	tickLengthMajor,
	tickLengthMinor,
	numColumns;

function handleOptions(options) {
	maxWidth = options.maxWidth || 950;
	maxHeight = options.maxHeight || 660;
	colWidth = options.colWidth || null; // if colWidth not specified, get from on maxWidth
	sidebarWidth = options.sidebarWidth || 50;
	leftTextMargin = options.leftTextMargin || 5;
	topTextMargin = options.topTextMargin || 0;
	headerRowY = options.headerRowY || 25;
	headerTextSize = options.headerTextSize || 16;
	tickLengthMajor = options.tickLengthMajor || 10;
	tickLengthMinor = options.tickLengthMinor || 5;
}

const bottomPadding = 5;

/**
 * Scale a number of minutes to pixels
 * @param {number} minutes  Number of minutes
 * @return {number}         Number of pixels
 */
function minutesToPixels(minutes) {
	return Math.floor(conversionFactor * minutes);
}

/**
 * Create a conversion factor for minutes to pixels. If we want to scale 10 minutes to 100 pixels:
 *   minutes * factor = pixels
 *   10      * factor = 100     <-- factor of 10
 * Solving for factor:
 *   factor = pixels / minutes
 * This function scales for the maximum height of the timeline minus extra stuff above and below
 * (header and footer items)
 *
 * @param {number} totalMinutes  Total number of minutes for this procedure/timeline
 * @return {number}              Converstion factor for minutes-->pixels
 */
function getConversionFactor(totalMinutes) {
	return (maxHeight - bottomPadding - headerRowY) / totalMinutes;
}

function addBox(canvas, opts = {}) {
	const required = ['width', 'height', 'x', 'y'];
	const defaults = {
		stroke: '#000',
		fillColor: '#000'
	};
	for (const prop of required) {
		if (opts[prop] === null) {
			throw new Error(`Function requires ${prop} property of options argument`);
		}
	}
	for (const prop in defaults) {
		if (opts[prop] === null) {
			opts[prop] = defaults[prop];
		}
	}

	canvas
		.rect(
			opts.width,
			opts.height
		)
		.stroke(opts.stroke)
		.move(
			opts.x,
			opts.y
		)
		.fill(opts.fillColor);
}

function addText(canvas, opts, textFn) {

	// set option defaults
	const defaults = {
		text: '<placeholder text>',
		x: 0,
		y: 0,
		color: '#000',
		family: 'Arial',
		size: 12,
		weight: 'normal',
		anchor: 'start',
		leading: 1.3
	};

	// todo Make an app/helpers/defaults.js to do this. Could also use npm package 'defaults' but
	// todo this is so straightforward it seems better to limit dependencies
	for (const prop in defaults) {
		if (typeof opts[prop] === 'undefined') {
			opts[prop] = defaults[prop];
		}
	}

	const text = textFn || opts.text;

	// Add the text to the canvas
	canvas
		.text(text)
		.move(
			opts.x,
			opts.y
		)
		.font({
			fill: opts.color,
			family: opts.family,
			size: opts.size,
			weight: opts.weight,
			anchor: opts.anchor,
			leading: opts.leading
		});

}

function getColumnLeft(columnIndex) {
	return sidebarWidth + columnIndex * colWidth;
}

function addActivity(canvas, columnIndex, task, actor) {

	const xLeft = getColumnLeft(columnIndex);

	const boxOpts = {
		width: colWidth,
		height: minutesToPixels(task.actorRolesDict[actor].duration.getTotalMinutes()),
		x: xLeft,
		y: headerRowY + minutesToPixels(task.actorRolesDict[actor].startTime.getTotalMinutes()),
		stroke: '#000',
		fillColor: task.color || '#F0FFFF'
	};

	addBox(canvas, boxOpts);

	const textOpts = {
		x: boxOpts.x + leftTextMargin,
		y: boxOpts.y + topTextMargin,
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

function addColumnHeader(canvas, columnIndex, headerText) {

	const xLeft = getColumnLeft(columnIndex);

	const boxOpts = {
		width: colWidth,
		height: headerRowY,
		x: xLeft,
		y: 0,
		stroke: '#000',
		fillColor: 'white'
	};

	addBox(canvas, boxOpts);

	const textOpts = {
		text: headerText.toUpperCase(),
		x: xLeft + leftTextMargin + Math.floor(colWidth / 2),
		y: Math.floor((headerRowY - headerTextSize) / 2),
		color: '#000',
		family: 'Arial',
		size: headerTextSize,
		weight: 'bold',
		anchor: 'middle',
		leading: 0
	};

	addText(canvas, textOpts);

}

function addTimelineMarkings(canvas, numColumns) {

	// how many half-hour segments to generate
	const halfHours = Math.ceil(totalMinutes / 30);

	for (let i = 0; i <= halfHours; i++) {

		const isHour = (i % 2) === 0;

		// eslint-disable-next-line no-restricted-properties
		const hours = Math.floor(i / 2).toString().padStart(2, '0');
		const minutes = isHour ? ':00' : ':30';
		const timeString = hours + minutes;

		// line sticks out further from sidebar on hours than on half-hours
		const tickLength = isHour ? tickLengthMajor : tickLengthMinor;

		// start and end coordinates for each line
		const y = headerRowY + minutesToPixels(i * 30);
		const rightX = sidebarWidth + (numColumns * colWidth) + tickLength;
		const leftX = sidebarWidth - tickLength;

		// right edge of image
		const rightEdge = (2 * sidebarWidth) + (numColumns * colWidth);

		// draws a line across the whole timeline, from left sidebar to right sidebar
		canvas
			.line(
				leftX,
				y,
				rightX,
				y
			)
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
		textOptions.x = rightEdge - 28; // same text, just shift the x coordinate
		addText(canvas, textOptions);

	}

}

module.exports = class TimelineWriter {

	/**
	 * Construct TimelineWriter object
	 * @param  {Procedure} procedure  Procedure object
	 * @param  {Object} options       Options like {maxHeight: 300, colWidth: 100}
	 */
	constructor(procedure, options = {}) {

		this.procedure = procedure;
		totalMinutes = procedure.getActualDuration().getTotalMinutes();
		handleOptions(options);

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

		numColumns = this.columns.length;
		colWidth = Math.floor((maxWidth - (2 * sidebarWidth)) / numColumns);

		// Duration rounded up to the nearest half hour, so last tick-mark and time shows on sidebar
		const roundMinutesUpToHalfHour = Math.ceil(totalMinutes / 30) * 30;

		// Create pixels-to-minutes conversion factor, used by minutesToPixels function
		conversionFactor = getConversionFactor(roundMinutesUpToHalfHour);

		// bottomPadding gives room for text below line
		imageHeight = headerRowY + minutesToPixels(roundMinutesUpToHalfHour) + bottomPadding;

	}

	/**
	 * Generate the actual timeline SVG. This is broken into its own function rather than being done
	 * in the constructor because the construct will likely be generalized for multiple timeline
	 * formats, not just SVG, but the code below is SVG-specific.
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
		this.canvas = SVG(document.documentElement);

		// Create the underlying lines and text for the timeline (not tasks themselves)
		addTimelineMarkings(this.canvas, numColumns);

		// Create the headers for each column
		this.columns.forEach((actor, index) => {
			const headerDisplay = this.procedure.getColumnHeaderTextByActor(actor);
			addColumnHeader(this.canvas, index, headerDisplay);
		});

		// Add tasks to the timeline
		for (const task of this.procedure.tasks) {
			for (const actor in task.actorRolesDict) {
				const columnIndex = this.actorToTimelineColumn[actor];
				addActivity(this.canvas, columnIndex, task, actor);
			}
		}

	}

	writeSVG(filename) {
		fs.writeFileSync(filename, this.canvas.svg());
	}

	writePNG(filename, callback) {
		const dimensions = {
			width: (2 * sidebarWidth) + (numColumns * colWidth),
			height: imageHeight,
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
};
