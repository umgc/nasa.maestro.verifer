'use strict';

const TimelineWriter = require('./TimelineWriter');

const nunjucks = require('../../helpers/nunjucks');

function getActivity(writer, columnIndex, task, actor) {

	const opts = {
		height: writer.minutesToPixels(task.actorRolesDict[actor].duration.getTotalMinutes(), false)
	};
	opts.stroke = '#000';
	opts.fillColor = task.color || '#F0FFFF';

	opts.title = task.title.toUpperCase();
	opts.duration = task.actorRolesDict[actor].duration.format('H:M');

	opts.textSize = 12; // potentially adjusted smaller by logic below

	if (opts.height < 16) {
		opts.textSize = 8;
	}

	// todo: More logic that is present in SVG that is not yet implemented in HTML
	// todo: specifically: scaling text size or shifting text up to fit better in a smaller box
	// css add color=#000, family=Arial, size default = 12, margin/padding
	// else if (boxOpts.height < 22) {
	// // default in CSS, should be writer.topTextMargin
	// textOpts.y = textOpts.y - 6; // box getting too short, make more room
	// if (boxOpts.height > 10) {
	// }

	return nunjucks.render('timeline-task-block.njk', opts);

}

function getTimelineMarkings(writer) {

	// how many half-hour segments to generate
	const halfHours = Math.ceil(writer.totalMinutes / 30);
	const blockHeight = writer.minutesToPixels(30, false);

	const timelineMarkings = [];

	for (let i = 0; i <= halfHours; i++) {

		const isHour = (i % 2) === 0;

		// eslint-disable-next-line no-restricted-properties
		const hours = Math.floor(i / 2).toString().padStart(2, '0');
		const minutes = isHour ? ':00' : ':30';
		const timeString = hours + minutes;

		timelineMarkings.push({ blockHeight, timeString });
	}

	return timelineMarkings;

}

module.exports = class HtmlTimelineWriter extends TimelineWriter {

	// NOTE: Could extend constructor to modify base options

	/**
	 * Generate the timeline HTML
	 *
	 * @return {string} HTML of timeline
	 */
	create() {

		// Create the underlying lines and text for the timeline (not tasks themselves)
		const timelineMarkings = getTimelineMarkings(this);

		const columnDisplay = [];

		// Add tasks to the timeline
		for (const task of this.procedure.tasks) {
			for (const actor in task.actorRolesDict) {
				const columnIndex = this.actorToTimelineColumn[actor];

				if (!columnDisplay[columnIndex]) {
					columnDisplay[columnIndex] = {
						header: this.procedure.getColumnHeaderTextByActor(actor),
						activityBlocks: []
					};
				}

				columnDisplay[columnIndex].activityBlocks.push(
					getActivity(this, columnIndex, task, actor)
				);
			}
		}
		const html = nunjucks.render('timeline.njk', {
			columnDisplay: columnDisplay,
			columnWidth: this.columnWidth,
			timelineMarkings: timelineMarkings
		});

		return html;
	}

};
