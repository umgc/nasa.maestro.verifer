'use strict';

const lodashFlatten = require('lodash/flatten');

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
	 * Scale a number of minutes to pixels
	 * @param {number} minutes         Number of minutes
	 * @param {boolean} round          Whether or not to floor the result
	 * @return {number}                Number of pixels
	 */
	minutesToPixels(minutes, round = true) {
		if (round) {
			return Math.floor(this.conversionFactor * minutes);
		}
		return this.conversionFactor * minutes;
	}

};
