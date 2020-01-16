/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const assert = require('chai').assert;

const arrayHelper = require('./arrayHelper');

describe('arrayHelper', function() {

	describe('parseArray()', function() {

		it('should convert string to single element array', function() {
			assert.deepEqual(
				arrayHelper.parseArray('a string'),
				['a string']
			);
		});

		it('should return the same array if array is input', function() {
			assert.deepEqual(
				arrayHelper.parseArray(['an', 'array']),
				['an', 'array']
			);
		});

		it('should clone array inputs (not return reference to original array)', function() {
			const input = ['another', 'array'];
			assert.notEqual(
				arrayHelper.parseArray(input),
				input
			);
		});

	});

	describe('parseToArrayOrString()', function() {
		const tests = [
			{ input: 'a string', expected: 'a string' },
			{ input: ['a string'], expected: 'a string' },
			{ input: ['two', 'strings'], expected: ['two', 'strings'] },
			{ input: ['', 'and not empty'], expected: 'and not empty' },
			{ input: [], expected: '' },
			{ input: ['', '', '', ''], expected: '' }
		];

		for (const test of tests) {
			it(`should return ${test.expected} on input ${test.input}`, function() {
				assert.deepStrictEqual(arrayHelper.parseToArrayOrString(test.input), test.expected);
			});
		}
	});

	describe('allAdjacent()', function() {
		const tests = [
			{ input: [1, 2, 3], expected: true },
			{ input: [1, 3, 5], expected: false },
			{ input: [6, 5, 4, 3, 2, 1], expected: true },
			{ input: [5, 5, 5, 5, 5, 5], expected: true },
			{ input: [1, 0, -1], expected: true },
			{ input: [1, -1], expected: false },

			// non-integers not the intent of this function, but they work, too.
			{ input: [0, 0.1], expected: true },
			{ input: [0, 1.1], expected: false }
		];

		for (const test of tests) {
			it(`should return ${test.expected} on input ${test.input}`, function() {
				assert.strictEqual(arrayHelper.allAdjacent(test.input), test.expected);
			});
		}
	});

	describe('repeatArray()', function() {
		const tests = [
			{ inputArray: [1, 2, 3], inputCount: 5, expected: [1, 2, 3, 1, 2] },
			{ inputArray: [1, 2, 3], inputCount: 2, expected: [1, 2, 3] },
			{ inputArray: [1, 2, 3], inputCount: 3, expected: [1, 2, 3] },
			{ inputArray: [1, 2, 3], inputCount: 0, expected: [1, 2, 3] },
			{ inputArray: [1, 2, 3], inputCount: -1, expected: [1, 2, 3] },
			{ inputArray: [1, 2, 3], inputCount: 20,
				expected: [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2] },
			{
				inputArray: ['asdf', [{ x: 'x' }], { y: 'y' }],
				inputCount: 8,
				expected: ['asdf', [{ x: 'x' }], { y: 'y' }, 'asdf', [{ x: 'x' }], { y: 'y' },
					'asdf', [{ x: 'x' }]]
			}
		];

		for (const test of tests) {
			const stringified = JSON.stringify(test.inputArray);
			const msg = test.inputArray.length < test.inputCount ?
				`lengthen the input ${stringified} to ${test.inputCount}` :
				`keep the input array ${stringified} unchanged for length ${test.inputCount}`;

			it(`should ${msg}`, function() {
				assert.deepEqual(
					arrayHelper.repeatArray(test.inputArray, test.inputCount),
					test.expected
				);
			});
		}
	});

	describe('isAnyOf()', function() {

		const referenceVar = { my: 'object' };

		const tests = [
			{ needle: 1, haystack: [1, 2, 3], expected: true },
			{ needle: 6, haystack: [1, 2, 3], expected: false },

			// find the object by reference
			{ needle: referenceVar, haystack: [1, 2, referenceVar, 4], expected: true },

			// don't find these deeply-equal objects
			{ needle: { my: 'object' }, haystack: [1, 2, referenceVar, 4], expected: false },
			{ needle: referenceVar, haystack: [1, 2, { my: 'object' }, 4], expected: false }
		];

		for (const test of tests) {
			const found = test.expected ? 'find' : 'not find';
			const trueOrFalseFn = test.expected ? 'isTrue' : 'isFalse';
			const result = arrayHelper.isAnyOf(test.needle, test.haystack);

			it(`should ${found} ${test.needle} in ${JSON.stringify(test.haystack)}`, function() {
				assert.isBoolean(result);
				assert[trueOrFalseFn](result);
			});
		}

	});
});
