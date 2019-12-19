/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const assert = require('chai').assert;
const filters = require('./filters');

const tests = [
	{
		input: 'This is  my string',
		expected: 'this-is-my-string',
		hash: '7493e4b59'
	},
	{
		input: 'This ____-----  -----  is  my string',
		expected: 'this-is-my-string',
		hash: '70b8926fa'
	},
	{
		input: 'MÆVE is awesome',
		expected: 'mve-is-awesome',
		hash: 'ecbbe5d82'
	},
	{
		input: 'This\nhas\nnewlines',
		expected: 'this-has-newlines',
		hash: '15cbecec0'
	},
	{
		input: 'IV + EV1 + EV2',
		expected: 'iv-ev1-ev2',
		hash: 'd13717272'
	}
];

describe('filters', function() {
	describe('uniqueHtmlId()', function() {
		for (let i = 0; i < tests.length; i++) {
			const test = tests[i];

			it(`should properly convert "${test.input}"`, function() {
				assert.strictEqual(
					filters.uniqueHtmlId(test.input),
					`${test.expected}-${test.hash}`
				);
				assert.strictEqual(
					filters.uniqueHtmlId(test.input, false),
					test.expected
				);
			});

		}
	});
});
