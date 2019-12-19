/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const TimelineWriterTester = require('../../../test/helpers/TimelineWriterTester');
const HtmlTimelineWriter = require('./HtmlTimelineWriter');

const tester = new TimelineWriterTester(HtmlTimelineWriter);

describe('HtmlTimelineWriter', function() {

	describe('create()', function() {
		tester.testCreate();
	});

});
