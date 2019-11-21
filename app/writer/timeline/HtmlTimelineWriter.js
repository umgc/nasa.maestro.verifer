'use strict';

const path = require('path');
const TimelineWriter = require('./TimelineWriter');

const nunjucks = require('nunjucks');

const nunjucksEnvironment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(path.join(__dirname, '../../view')),
	{ autoescape: false }
);

function getActivity(writer, columnIndex, task, actor) {

	const opts = {
		width: writer.colWidth,
		height: writer.minutesToPixels(task.actorRolesDict[actor].duration.getTotalMinutes())
	};
	opts.height--; // remove a pixel for the thickness of the border
	opts.marginTop = -1; // make this box overlap the previous box by 1px (accounting for border px)
	opts.stroke = '#000';
	opts.fillColor = task.color || '#F0FFFF';

	opts.title = task.title.toUpperCase();
	opts.duration = task.actorRolesDict[actor].duration.format('H:M');

	opts.textSize = 12; // potentially adjusted smaller by logic below

	if (task.actorRolesDict[actor].prevTask) {
		const minutesGap =
			task.actorRolesDict[actor].startTime.getTotalMinutes() -
			task.actorRolesDict[actor].prevTask.actorRolesDict[actor].endTime.getTotalMinutes();
		opts.marginTop += writer.minutesToPixels(minutesGap);
	}

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

	return nunjucksEnvironment.render('timeline-task-block.njk', opts);

}

function getTimelineMarkings(writer) {

	/*
    <div style="display:inline-block; vertical-align:top;">
        <div class='activity-column' style='width: 70px; text-align: right;'>
            <div style="height: 60px;">00:00 —</div>
            <div style="height: 60px;">00:30 —</div>
            <div style="height: 60px;">01:00 —</div>
            <div style="height: 60px;">01:30 —</div>
        </div>
    </div>
	*/

	// how many half-hour segments to generate
	const halfHours = Math.ceil(writer.totalMinutes / 30);
	const blockHeight = writer.minutesToPixels(30);

	const timelineMarkings = { left: [], right: [] };

	for (let i = 0; i <= halfHours; i++) {

		const isHour = (i % 2) === 0;

		// eslint-disable-next-line no-restricted-properties
		const hours = Math.floor(i / 2).toString().padStart(2, '0');
		const minutes = isHour ? ':00' : ':30';
		const timeString = hours + minutes;

		// todo: SVG aspect not yet implemented in HTML
		// line sticks out further from sidebar on hours than on half-hours
		// const tickLength = isHour ? writer.tickLengthMajor : writer.tickLengthMinor;

		timelineMarkings.left.push(`<div style="height: ${blockHeight}px;">${timeString} —</div>`);
		timelineMarkings.right.push(`<div style="height: ${blockHeight}px;">— ${timeString}</div>`);
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
		const html = nunjucksEnvironment.render('timeline.njk', {
			columnDisplay: columnDisplay,
			columnWidth: this.columnWidth,
			timelineMarkings: timelineMarkings
		});

		return html;
	}

};
