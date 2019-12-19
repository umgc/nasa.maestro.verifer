/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const assert = require('chai').assert;
const jsonHelper = require('./jsonHelper');

const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { d: { one: { one: 1 }, two: [2, 'two'] } };
const obj3 = { e: 1, f: obj1, g: [1, 2, 3] };
obj1.three = obj3;
const obj4 = { h: obj2, h2: obj2, h3: obj2 };
const obj5 = { i: obj1, j: obj3 };
const obj6 = [1, 2, obj1, obj3, obj5];

const tests = [
	{
		input: obj1,
		expected: {
			showDupes: '{"a":1,"b":2,"c":3,"three":{"e":1,"f":"[duplicate value]","g":[1,2,3]}}',
			noDupes: '{"a":1,"b":2,"c":3,"three":{"e":1,"g":[1,2,3]}}'
		}
	},
	{
		input: obj2,
		expected: {
			showDupes: '{"d":{"one":{"one":1},"two":[2,"two"]}}',
			noDupes: '{"d":{"one":{"one":1},"two":[2,"two"]}}'
		}
	},
	{
		input: obj3,
		expected: {
			showDupes: '{"e":1,"f":{"a":1,"b":2,"c":3,"three":"[duplicate value]"},"g":[1,2,3]}',
			noDupes: '{"e":1,"f":{"a":1,"b":2,"c":3},"g":[1,2,3]}'
		}
	},
	{
		input: obj4,
		expected: {
			showDupes: '{"h":{"d":{"one":{"one":1},"two":[2,"two"]}},"h2":"[duplicate value]","h3":"[duplicate value]"}',
			noDupes: '{"h":{"d":{"one":{"one":1},"two":[2,"two"]}}}'
		}
	},
	{
		input: obj5,
		expected: {
			showDupes: '{"i":{"a":1,"b":2,"c":3,"three":{"e":1,"f":"[duplicate value]","g":[1,2,3]}},"j":"[duplicate value]"}',
			noDupes: '{"i":{"a":1,"b":2,"c":3,"three":{"e":1,"g":[1,2,3]}}}'
		}
	},
	{
		input: obj6,
		expected: {
			showDupes: '[1,2,{"a":1,"b":2,"c":3,"three":{"e":1,"f":"[duplicate value]","g":[1,2,3]}},"[duplicate value]",{"i":"[duplicate value]","j":"[duplicate value]"}]',
			noDupes: '[1,2,{"a":1,"b":2,"c":3,"three":{"e":1,"g":[1,2,3]}},null,{}]'
		}
	}
];

describe('jsonHelper', function() {
	describe('stringifyNoDuplicates()', function() {
		for (let i = 0; i < tests.length; i++) {
			const test = tests[i];

			const actualShowDupes = jsonHelper.stringifyNoDuplicates(test.input, true);
			it(`should properly stringify test ${i} when showing duplicates`, function() {
				assert.strictEqual(actualShowDupes, test.expected.showDupes);
			});

			const actualNoDupes = jsonHelper.stringifyNoDuplicates(test.input, false);
			it(`should properly stringify test ${i} when not showing duplicates`, function() {
				assert.strictEqual(actualNoDupes, test.expected.noDupes);
			});
		}
	});
});
