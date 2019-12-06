'use strict';

const Ajv = require('ajv');

const schemas = {
	procedure: require('./procedureSchema.json'),
	task: require('./taskSchema.json')
};

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

class SchemaValidationError extends Error {
	constructor(message, errors) {
		super(message);
		this.validationErrors = errors;
	}
}

/**
 * Validates a file against a YAML schema.
 *
 * @param {string} type              Either 'task' or 'procedure' to pick schema to validate against
 * @param {Object} objectToValidate  A JS object, probably from parsed JSON/YAML. Not a YAML/JSON
 *                                   string
 * @return {boolean}                 Returns boolean true if passes validation. Throws exception if
 *                                   doesn't pass
 * @throws SchemaValidationError when validation fails
 */
module.exports = function(type, objectToValidate) {
	if (Object.keys(schemas).indexOf(type) === -1) {
		const keys = Object.keys(schemas);
		throw new Error(`"type" of "${type}" not valid. Must be in ${JSON.stringify(keys)}`);
	}

	// Validate
	// ajv.validate returns boolean, with errors in ajv.errors if applicable
	var valid = ajv.validate(schemas[type], objectToValidate);
	if (!valid) {
		throw new SchemaValidationError('Schema Validation Failed', ajv.errors);
	}

	return valid;
};
