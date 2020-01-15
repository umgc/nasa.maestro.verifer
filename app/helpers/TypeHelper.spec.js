/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const assert = require('chai').assert;

const typeHelper = require('./typeHelper');

describe('typeHelper', function() {

	describe('is()', function() {
		const aFunc = () => {
			return true;
		};
		class FakeClass {
			constructor() {
				this.x = 1;
			}
		}
		class AnotherFake {
			constructor() {
				this.y = 5;
			}
		}
		const fake = new FakeClass();
		const tests = [
			{ inputValue: [1, 2, 3], inputTypes: 'array', expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['array'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['object'], expected: 'object' }, // arrays are obj
			{ inputValue: [1, 2, 3], inputTypes: ['string', 'object'], expected: 'object' },
			{ inputValue: [1, 2, 3], inputTypes: ['scalar', 'string', 'function'], expected: false },
			{ inputValue: [1, 2, 3], inputTypes: ['array', 'array'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['array', 'scalar'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['array', 'boolean'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['array', 'integer'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['array', 'number'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['array', 'string'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['array', 'function'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['array', 'object'], expected: 'array' },

			// order doesn't matter for types the value doesn't match
			{ inputValue: [1, 2, 3], inputTypes: ['scalar', 'array'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['boolean', 'array'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['integer', 'array'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['number', 'array'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['string', 'array'], expected: 'array' },
			{ inputValue: [1, 2, 3], inputTypes: ['function', 'array'], expected: 'array' },

			// order does matter in this case, since an array is an object
			{ inputValue: [1, 2, 3], inputTypes: ['object', 'array'], expected: 'object' },

			// bool
			{ inputValue: true, inputTypes: ['function', 'boolean'], expected: 'boolean' },
			{ inputValue: true, inputTypes: ['function', 'string'], expected: false },

			// scalar
			{ inputValue: 1, inputTypes: ['function', 'scalar'], expected: 'scalar' },
			{ inputValue: false, inputTypes: ['function', 'scalar'], expected: 'scalar' },
			{ inputValue: 1.2342, inputTypes: ['function', 'scalar'], expected: 'scalar' },
			{ inputValue: 'test', inputTypes: ['function', 'scalar'], expected: 'scalar' },
			{ inputValue: { my: 'obj' }, inputTypes: ['function', 'scalar'], expected: false },

			// int
			{ inputValue: 1, inputTypes: ['function', 'integer'], expected: 'integer' },
			{ inputValue: 0, inputTypes: ['function', 'integer'], expected: 'integer' },
			{ inputValue: -1, inputTypes: ['function', 'integer'], expected: 'integer' },
			{ inputValue: 1.2, inputTypes: ['function', 'integer'], expected: false },
			{ inputValue: 'a string', inputTypes: ['function', 'integer'], expected: false },

			// number
			{ inputValue: 1, inputTypes: ['function', 'number'], expected: 'number' },
			{ inputValue: 0, inputTypes: ['function', 'number'], expected: 'number' },
			{ inputValue: -1, inputTypes: ['function', 'number'], expected: 'number' },
			{ inputValue: 1.2, inputTypes: ['function', 'number'], expected: 'number' },
			{ inputValue: 'a string', inputTypes: ['function', 'number'], expected: false },

			// string
			{ inputValue: 'a string', inputTypes: ['object', 'string'], expected: 'string' },
			{ inputValue: 0, inputTypes: ['object', 'string'], expected: false },
			{ inputValue: 1.2, inputTypes: ['object', 'string'], expected: false },
			{ inputValue: { my: 'obj' }, inputTypes: ['integer', 'string'], expected: false },

			// function
			{ inputValue: () => { return false; }, inputTypes: ['string', 'function'],
				expected: 'function' },
			{ inputValue: function() { return false; }, inputTypes: ['string', 'function'],
				expected: 'function' },
			{ inputValue: aFunc, inputTypes: ['string', 'function'], expected: 'function' },
			{ inputValue: aFunc, inputTypes: ['object', 'function'], expected: 'function' },

			// object
			{ inputValue: { my: 'obj' }, inputTypes: ['integer', 'object'], expected: 'object' },

			// object, but possibly confusingly so
			{ inputValue: [1, 2, 3], inputTypes: ['integer', 'object'], expected: 'object' },

			// object-not-array
			{
				inputValue: { my: 'obj' },
				inputTypes: ['integer', 'object-not-array'],
				expected: 'object-not-array'
			},
			{
				inputValue: [1, 2, 3],
				inputTypes: ['integer', 'object-not-array'],
				expected: false
			},

			// constructor
			{ inputValue: fake, inputTypes: ['integer', FakeClass], expected: FakeClass },
			{ inputValue: fake, inputTypes: ['integer', AnotherFake], expected: false },
			{ inputValue: fake, inputTypes: [AnotherFake, 'object'], expected: 'object' },
			{ inputValue: { x: 1 }, inputTypes: [FakeClass, 'integer'], expected: false },

			// falsy
			{ inputValue: '', inputTypes: ['falsy'], expected: 'falsy' },
			{ inputValue: '1234', inputTypes: ['falsy'], expected: false },
			{ inputValue: { x: 1 }, inputTypes: ['falsy', 'object'], expected: 'object' },
			{ inputValue: { x: 1 }, inputTypes: ['falsy', 'array'], expected: false }

		];

		for (const test of tests) {
			const input = typeof test.inputValue === 'function' ? 'function' : test.inputValue;
			const exp = typeof test.expected === 'string' ? test.expected : test.expected.constructor.name;
			const types = JSON.stringify(test.inputTypes);
			it(`should determine ${input} is ${exp} for valid types ${types}`, function() {
				assert.strictEqual(
					typeHelper.is(test.inputValue, test.inputTypes),
					test.expected
				);
			});

			if (Array.isArray(test.inputTypes)) {
				it('...same as previous but passed as separate inputs rather than array', function() {
					assert.strictEqual(
						typeHelper.is(test.inputValue, ...test.inputTypes),
						test.expected
					);
				});
			}
		}

	});

	describe('errorIfIsnt()', function() {
		const goodInputs = [
			{ inputValue: [1, 2, 3], inputTypes: ['scalar', 'array'] },
			{ inputValue: -1, inputTypes: ['function', 'number'] },
			{ inputValue: 'test', inputTypes: ['function', 'scalar'] }
		];

		const badInputs = [
			{ inputValue: [1, 2, 3], inputTypes: ['scalar', 'function'] },
			{ inputValue: -1, inputTypes: ['function', 'string'] },
			{ inputValue: 'test', inputTypes: ['object', 'boolean'] }
		];

		for (const test of goodInputs) {
			it(`should not throw error for ${test.inputValue} in ${test.inputTypes}`, function() {
				assert.doesNotThrow(function() {
					typeHelper.errorIfIsnt(test.inputValue, test.inputTypes);
				});
				assert.isFalse(typeHelper.errorIfIsnt(test.inputValue, test.inputTypes));
			});
		}

		for (const test of badInputs) {
			it(`should throw error for ${test.inputValue} not in ${test.inputTypes}`, function() {
				assert.throws(function() {
					typeHelper.errorIfIsnt(test.inputValue, test.inputTypes);
				});
			});
		}

	});

});
