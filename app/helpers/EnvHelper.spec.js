/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const assert = require('chai').assert;

const envHelper = require('./envHelper');

describe('envHelper', function() {

	describe('isBrowser', function() {
		it('should return false when executed in node.js', function() {
			assert.isFalse(envHelper.isBrowser);
		});
	});

	describe('isNode', function() {
		it('should return true when executed in node.js', function() {
			assert.isTrue(envHelper.isNode);
		});
	});

});
