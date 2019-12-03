'use strict';

module.exports = {

	/**
	 * How we're avoiding circular references while stringifying. This removes all duplicates, even
	 * if not circular references.
	 *
	 * Ref: https://stackoverflow.com/a/11616993
	 *
	 * @param {Object}   object         Object to stringify (note: in JS most things are objects)
	 * @param {boolean}  dupesAsString  Whether to show '[duplicate value]' or nothing for dupes
	 * @return {string}                 JSON string
	 */
	stringifyNoDuplicates: function(object, dupesAsString = true) {
		const cache = [];
		return JSON.stringify(object, (key, value) => {
			if (typeof value === 'object' && value !== null) {
				if (cache.indexOf(value) !== -1) {
					// Duplicate reference found, discard key
					return dupesAsString ? '[duplicate value]' : undefined;
				}
				// Store value in our collection
				cache.push(value);
			}
			return value;
		});
	}
};
