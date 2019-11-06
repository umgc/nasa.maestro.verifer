'use strict';

module.exports = class Abstract {

	constructor(abstractMethods = [], abstractStaticMethods = []) {

		for (const fn of abstractStaticMethods) {
			if (typeof this.constructor[fn] !== 'function') {
				throw new Error(`Abstract static function "${fn}" not implemented in class ${this.constructor.name}`);
			}
		}

		for (const fn of abstractMethods) {
			if (typeof this[fn] !== 'function') {
				throw new Error(`Abstract method "${fn}" not implemented in class ${this.constructor.name}`);
			}
		}

	}

};
