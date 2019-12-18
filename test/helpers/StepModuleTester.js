/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const assert = require('chai').assert;
const Step = require('../../app/model/Step');
const stepModules = require('../../app/step-mods/stepModules');

module.exports = class StepModuleTester {

	constructor(moduleKey) {
		this.moduleInfo = this.getModuleInfo(moduleKey);
		this.ModuleClass = require(`../../app/step-mods/${this.moduleInfo.class}`);
		this.goodInputs = [];
		this.badInputs = [];
		// const asdf = new Asdf();
		// asdf.addGoodInputs(goodSettings);
		// asdf.addBadInputs(badSettings);
		// asdf.generateModules();
	}

	getModuleInfo(moduleKey) {
		// const moduleInstance = goodSettings[0].module;
		// const className = moduleInstance.constructor.name;
		// let foundModule = false;
		for (const mod of stepModules) {
			if (mod.key === moduleKey) {
				return mod;
			}
		}
		// it('should set this.key matching stepModules.js', function() {
		// assert.isTrue(foundModule);
		// });
	}

	addGoodInputs(inputs) {
		if (!Array.isArray(inputs)) {
			inputs = [inputs];
		}
		for (let i = 0; i < inputs.length; i++) {
			const valid = inputs[i].actual &&
				inputs[i].actual[this.moduleInfo.key] &&
				inputs[i].expected &&
				inputs[i].expected.properties &&
				inputs[i].expected.alterStepBase;

			if (!valid) {
				throw new Error('Good inputs must have expected properties');
			}
		}
		this.goodInputs.push(...inputs);
	}

	addBadInputs(inputs) {
		if (!Array.isArray(inputs)) {
			inputs = [inputs];
		}
		for (let i = 0; i < inputs.length; i++) {
			const valid = inputs[i][this.moduleInfo.key];
			if (!valid) {
				throw new Error('Bad inputs must have expected properties');
			}
		}
		this.badInputs.push(...inputs);
	}

	generateModule(setting) {
		const step = new Step();
		step.populateFromYaml(setting.actual);
		return new this.ModuleClass(
			step,
			setting.actual
		);
	}

	testConstructor() {

		for (const setting of this.badInputs) {
			it(`should error if invalid input ${JSON.stringify(setting)} is supplied`, function() {
				assert.throws(function() {
					const step = new Step();
					step.populateFromYaml(setting);
					new this.ModuleClass(step, setting); // eslint-disable-line no-new
				});
			});
		}

		for (const setting of this.goodInputs) {
			const propNames = Object.keys(setting.expected.properties).join('/');
			const module = this.generateModule(setting);
			it(`should set ${propNames} for setting ${JSON.stringify(setting.actual)}`, function() {
				for (const prop in setting.expected.properties) {
					assert.equal(module[prop], setting.expected.properties[prop]);
				}
			});
		}
	}

	testAlterStepBase() {
		for (const setting of this.goodInputs) {
			const module = this.generateModule(setting);
			it(`should create basic string version from input ${JSON.stringify(setting.actual)}`, function() {
				assert.deepStrictEqual(
					module.alterStepBase(),
					setting.expected.alterStepBase
				);
			});
		}
	}

	/**
	 *
	 * @param {Object} changeFormat  Format of alterStepDocx output, like:
	 *                               {
	 *                                 base: {
	 *                                   -- content always is an array. Here an array of TextRuns
	 *                                   content: docx.TextRun,
	 *                                   type: 'APPEND'
	 *                                 }
	 *                               }
	 */
	testAlterStepDocx(changeFormat) {
		for (const setting of this.goodInputs) {
			describe(`Settings: ${JSON.stringify(setting.actual)}`, () => {
				const docxOutput = this.generateModule(setting).alterStepDocx();
				it('should return a object', function() {
					assert.isObject(docxOutput);
				});
				for (const element in changeFormat) {
					// element is "base", "title", "checkboxes", etc
					it(`should have .${element} as object`, function() {
						assert.isObject(docxOutput[element]);
					});

					it(`should have .${element}.content as array of ${changeFormat[element].content.name}`, function() {
						assert.isArray(docxOutput[element].content);
						assert.instanceOf(
							docxOutput[element].content[0],
							changeFormat[element].content
						);
					});

					it(`should have .${element}.type equal to ${changeFormat[element].type}`, function() {
						assert.strictEqual(docxOutput[element].type, changeFormat[element].type);
					});
				}
			});
		}
	}

};
