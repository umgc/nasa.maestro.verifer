/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const assert = require('chai').assert;
const cloneDeep = require('lodash/cloneDeep');
const objectHelper = require('./objectHelper');

describe('objectHelper', function() {
	describe('requireProps()', function() {

		it('should throw an error if required props missing', function() {
			assert.throws(function() {
				objectHelper.requireProps({}, ['requiredProp']);
			});
			assert.throws(function() {
				objectHelper.requireProps({ present: 'value' }, ['requiredProp']);
			});
			assert.throws(function() {
				objectHelper.requireProps({ present: 'value', another: 'val' }, ['requiredProp']);
			});
			assert.throws(function() {
				objectHelper.requireProps(
					{
						present: 'value',
						another: 'val',
						third: 'thing'
					},
					[
						'present',
						'another',
						'this-one-is-missing'
					]
				);
			});
		});

		it('should not throw an error if all are present', function() {
			assert.doesNotThrow(function() {
				objectHelper.requireProps({}, []);
			});
			assert.doesNotThrow(function() {
				objectHelper.requireProps({ present: 'value' }, ['present']);
			});
			assert.doesNotThrow(function() {
				objectHelper.requireProps({ present: 'value', another: 'val' }, ['present']);
			});
			assert.doesNotThrow(function() {
				objectHelper.requireProps(
					{
						present: 'value',
						another: 'val',
						third: 'thing'
					},
					[
						'present',
						'another',
						'third'
					]
				);
			});
		});

	});

	describe('defaults()', function() {

		it('should leave object unmodified on empty defaults object', function() {
			const test = {};
			objectHelper.defaults(test, {});
			assert.deepEqual(test, {});

			const test2 = { one: 1, two: 'two', three: [1, 2, 3] };
			const clone2 = cloneDeep(test2);
			objectHelper.defaults(test2, {});
			assert.deepEqual(test2, clone2);
		});

		it('should not alter existing properties', function() {
			const test = { one: 1111 };
			const clone = cloneDeep(test);
			objectHelper.defaults(test, { one: 1 });
			assert.deepEqual(test, clone);

			const test2 = { one: 1, two: 'two', three: [1, 2, 3] };
			const clone2 = cloneDeep(test2);
			objectHelper.defaults(test2, { two: 2 });
			assert.deepEqual(test2, clone2);
		});

		it('should add values for missing properties', function() {
			const test = { one: 1 };
			objectHelper.defaults(test, { two: 2 });
			assert.deepEqual(test, { one: 1, two: 2 });

			const original2 = { one: 1, two: 'two', three: [1, 2, 3] };
			const defaults2 = { four: { four: 4 }, five: [{ five: 5 }] };
			objectHelper.defaults(original2, defaults2);
			assert.deepEqual(
				original2,
				{ one: 1, two: 'two', three: [1, 2, 3], four: { four: 4 }, five: [{ five: 5 }] }
			);
		});

	});
});
