'use strict';

module.exports = {
	getKey: function(actIndex, divIndex, colKey, stepIndex) {
		if (!actIndex && typeof actIndex !== 'number') {
			throw new Error('at least actIndex is required for generating a maestro key');
		}
		const key = [];
		key.push(`act${actIndex}`);
		if (divIndex) {
			key.push(`div${divIndex}`);
		}
		if (colKey) {
			key.push(`${colKey}`);
		}
		if (stepIndex) {
			key.push(`step${stepIndex}`);
		}
		return key;
	}
};
