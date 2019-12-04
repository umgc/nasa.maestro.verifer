'use strict';

const crypto = require('crypto');

module.exports = {

	/**
	 * Convert a string to a unique HTML-friendly identifier
	 *
	 * @param {string} str  String to convert to a unique HTML-friendly identifier
	 * @return {string}     String converted to form "my-awesome-string-a556eced"
	 */
	uniqueHtmlId: function(str) {

		// Make standardized, HTML-friendly name:
		//   1. Convert groups of spaces/dashes/underscores to single dash
		//   2. Delete non-alphanumeric and dash chars to avoid special-char weirdness
		const simplifiedName = str
			.replace(/[\s_-]+/g, '-')
			.replace(/[^a-zA-Z0-9-]/g, '')
			.toLowerCase();

		// hash the full string just in case there were other important chars
		// uppercase the string to ensure we're starting from the same set of chars
		const hash = crypto.createHash('md5').update(str.toUpperCase()).digest('hex');

		return `${simplifiedName}-${hash.slice(0, 9)}`;
	}

};
