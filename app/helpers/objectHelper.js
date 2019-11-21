'use strict';

module.exports = {
	requireProps: function(obj, props) {
		for (const prop of props) {
			if (obj[prop] === null || obj[prop] === undefined) {
				throw new Error(`Property "${prop}" required for object ${JSON.stringify(obj)}`);
			}
		}
	},
	defaults: function(obj, defaults) {
		for (const prop in defaults) {
			if (obj[prop] === null || obj[prop] === undefined) {
				obj[prop] = defaults[prop];
			}
		}
	}
};
