/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const TimelineWriterTester = require('./helpers/TimelineWriterTester');
const HtmlTimelineWriter = require('../app/writer/timeline/HtmlTimelineWriter');

const tester = new TimelineWriterTester(HtmlTimelineWriter);

describe('HtmlTimelineWriter', function() {

	describe('create()', function() {
		tester.testCreate();
	});

});
