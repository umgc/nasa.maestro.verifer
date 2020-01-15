'use strict';

const validTypes = {
	scalar: (v) => {
		return ['boolean', 'string', 'number', 'bigint', 'symbol'].indexOf(typeof v) !== -1;
	},
	boolean: (v) => { return typeof v === 'boolean'; },
	integer: (v) => { return Number.isInteger(v); },
	number: (v) => { return typeof v === 'number'; },
	string: (v) => { return typeof v === 'string'; },
	array: (v) => { return Array.isArray(v); },
	function: (v) => { return typeof v === 'function'; },
	object: (v) => { return typeof v === 'object'; },
	'object-not-array': (v) => { return (typeof v === 'object' && !Array.isArray(v)); },
	falsy: (v) => { return !v; }
};

/**
 * Determine what type a value is within a list of possible values, or false if not one of those
 * types.
 *
 * @param {*} value                    Any type of variable to check its type.
 * @param  {...string|Function} types  Strings matching keys in validTypes, to check if 'value' is
 *                                     one of those types. Also can pass in a constructor function
 *                                     to check if 'value' is an instance of that constructor class.
 *                                     Valid inputs: scalar, boolean, integer, number, string,
 *                                     array, function, object, falsy, a constructor function.
 * @return {string|Function|boolean}   Return the string or constructor function if found, or false.
 */
function is(value, ...types) {
	// types will be an array by definition because of the ...types. If it has just one element, and
	// that element is itself an array, set types to that element (flatten the 2D array into 1D).
	if (types.length === 1 && Array.isArray(types[0])) {
		types = types[0];
	}

	for (const type of types) {
		const maybeIsClass = typeof type === 'function';
		const isValidType = typeof type === 'string' && validTypes[type];

		if (!maybeIsClass && !isValidType) {
			throw new Error(`typeHelper.is() does not support type ${type}`);
		}

		if (maybeIsClass && value instanceof type) {
			return type;
		} else if (isValidType && validTypes[type](value)) {
			return type;
		}
	}

	return false;
}

/**
 * Determine what type a value is within a list of possible values, or false if not one of those
 * types.
 *
 * @param {*} value                    Any type of variable to check its type.
 * @param  {...string|Function} types  Strings matching keys in validTypes, to check if 'value' is
 *                                     one of those types. Also can pass in a constructor function
 *                                     to check if 'value' is an instance of that constructor class.
 * @return {bool}                      Either throws error or returns false
 * @throws Error                       Throws if value doesn't match any of types
 */
function errorIfIsnt(value, ...types) {
	// see comment above in is()
	if (types.length === 1 && Array.isArray(types[0])) {
		types = types[0];
	}

	if (!is(value, types)) {
		throw new Error(`Value ${value} must be one of these types:\n  - ${types.join('\n  - ')}`);
	}
	return false; // didn't error
}

module.exports = {
	is: is,
	errorIfIsnt: errorIfIsnt
};
