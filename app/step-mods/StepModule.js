'use strict';

const TextTransform = require('../writer/TextTransform');

module.exports = class StepModule {

	constructor() {
		const abstractStaticMethods = [];
		for (const fn of abstractStaticMethods) {
			if (typeof this.constructor[fn] !== 'function') {
				throw new Error(`Abstract static function "${fn}" not implemented in class ${this.constructor.name}`);
			}
		}

		const abstractMethods = [
			'alterStepBase'
		];
		for (const fn of abstractMethods) {
			if (typeof this[fn] !== 'function') {
				throw new Error(`Abstract method "${fn}" not implemented in class ${this.constructor.name}`);
			}
		}
	}

	getOutputTypeFunctions(outputType) {
		const fns = {
			Base: ['Base'],
			EvaDocx: ['EvaDocx', 'Docx', 'Base'],
			Docx: ['Docx', 'Base'],
			EvaHtml: ['EvaHtml', 'Html', 'Base'],
			Html: ['Html', 'Base'],
			SodfDocx: ['SodfDocx', 'Docx', 'Base']
		};
		this.outputTypeFns = fns[outputType] || [];
		return this.outputTypeFns;
	}

	alterStep(outputType) {
		const functions = this.getOutputTypeFunctions(outputType);
		let fn;
		for (const suffix of functions) {
			fn = `alterStep${suffix}`;
			if (this[fn] && typeof this[fn] === 'function') {
				return this[fn]();
			}
		}
		throw new Error(`Output function matching ${fn} not found for ${this.constructor.name}`);
	}

	transform(text) {
		if (!this.outputTypeFns) {
			throw new Error('Can\'t call StepModule.transform() until StepModule.getOutputTypeFunctions() called');
		}
		let xformType;
		if (this.outputTypeFns.indexOf('Docx') !== -1) {
			xformType = 'docx';
		} else if (this.outputTypeFns.indexOf('Html') !== -1) {
			xformType = 'html';
		} else {
			xformType = 'text'; // todo not really sure this will work...transforms text to text...
		}
		if (!this.transformer) {
			this.transformer = new TextTransform(xformType);
		}
		return this.transformer.transform(text);
	}
};
