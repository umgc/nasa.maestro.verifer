'use strict';

module.exports = {

	isBrowser: (function() {
		return typeof window !== 'undefined' && this === window;
	}()),

	isNode: (function() {
		return typeof process === 'object' &&
			typeof process.versions === 'object' &&
			typeof process.versions.node !== 'undefined';
	}())
};
