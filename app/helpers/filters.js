'use strict';

const crypto = require('crypto');

module.exports = {

	/**
	 * Convert a string to a unique HTML-friendly identifier
	 *
	 * @param {string} str        String to convert to a unique HTML-friendly identifier
	 * @param {boolean} withHash  Whether or not to include a has on the end for more uniqueness.
	 * @return {string}           String converted to form "my-awesome-string" (withHash = false) or
	 *                            "my-awesome-string-a556eced" (withHash = true)
	 */
	uniqueHtmlId: function(str, withHash = true) {

		// Make standardized, HTML-friendly name:
		//   1. Convert groups of spaces/dashes/underscores to single dash
		//   2. Delete non-alphanumeric and dash chars to avoid special-char weirdness
		let idform = str
			.replace(/[^a-zA-Z0-9-\s]/g, '')
			.replace(/[\s_-]+/g, '-')
			.toLowerCase();

		// hash the full string just in case there were other important chars
		// uppercase the string to ensure we're starting from the same set of chars
		if (withHash) {
			idform += '-' + crypto.createHash('md5').update(str.toUpperCase()).digest('hex')
				.slice(0, 9);
		}

		return idform;
	}

};
