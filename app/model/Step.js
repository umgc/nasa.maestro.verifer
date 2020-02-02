'use strict';

const cloneDeep = require('lodash/cloneDeep');
const uuidv4 = require('uuid/v4');

const subscriptionHelper = require('../helpers/subscriptionHelper');
const arrayHelper = require('../helpers/arrayHelper');
const consoleHelper = require('../helpers/consoleHelper');
const stepModules = require('../writer/step-mods/stepModules');
const Duration = require('./Duration');

const loadedModules = {};

const props = {
	strings: ['title'],
	arrays: ['checkboxes', 'warnings', 'cautions', 'comments', 'notes']
};

module.exports = class Step {

	/**
	 *
	 * @param {Object} definition            Object with anything that can be within a step, like:
	 *                                     { text: "Things!", title: "Stuff!", checkboxes: [], ... }
	 * @param {Series} parent - Series to point to as parent ~~or null if no parent~~ fixme. In the
	 *                               future substeps may point to something other than a Series as
	 *                               their parent (either the parent Step, or something else).
	 */
	constructor(definition, parent) { // actorIdOrIds, taskRoles) {
		this.uuid = uuidv4();
		this.context = {};
		this.props = {}; // fixme setState wipes out this.props, which previously would have wiped out taskroles and actor stuff. verify no issues with switch to this.context. also this.props should be this.state maybe
		this.reloadSubscriberFns = []; // these can't be wiped out...FIXME keep pondering this
		this.setContext(parent, definition);
		this.setState(definition);
	}

	/**
	 * @param {Series|null} parent - Series to point to as parent, or null if no parent. In the
	 *                               future substeps may point to something other than a Series as
	 *                               their parent (either the parent Step, or something else).
	 * @param {Object} definition FIXME docs
	 */
	setContext(parent, definition) {
		this.parent = parent;

		// this needs to be re-run if a step is moved between _activities_
		// sets this.context.taskRoles & this.context.taskRolesMap
		this.mapTaskRolesToActor(parent.taskRoles);

		// this needs to be re-run if a step is moved between actors/roles/columns
		this.setActors(
			parent.seriesActors,
			definition // was definition.actor
		);
	}

	subscribeReload(subscriberFn) {
		const unsubscribeFn = subscriptionHelper.subscribe(
			subscriberFn,
			this.reloadSubscriberFns
		);
		return unsubscribeFn;
	}

	// FIXME this should probably be broken up into separate external use of setState and setContext
	reload(
		newDefinition = {},
		newActorIdOrIds = this.context.actorIdOrIds,
		newTaskRoles = this.context.taskRoles
	) {
		this.setContext(parent, newDefinition);
		this.setState(newDefinition, newActorIdOrIds, newTaskRoles);
		subscriptionHelper.run(this.reloadSubscriberFns, this);
	}

	getDefinition() {
		// FIXME need to output location

		const def = {};

		for (const prop of props.strings) {
			if (this.props[prop]) {
				def[prop] = this.props[prop];
			}
		}

		// Currently YAML "step" prop maps to model "text" prop. See comment in constructor.
		if (this.props.text.length > 1) {
			def.text = this.props.text.slice(); // copy the array
		} else if (this.props.text.length === 1) {
			def.text = this.props.text[0];
		}

		if (this.props.images.length) {
			def.images = cloneDeep(this.props.images);
		}

		for (const prop of props.arrays) {
			const parsedValue = arrayHelper.parseToArrayOrString(this.props[prop].slice());
			if (parsedValue !== '' && !arrayHelper.isEmptyArray(parsedValue)) {
				def[prop] = parsedValue;
			}
		}

		if (!arrayHelper.isEmptyArray(this.props.substeps)) {
			def.substeps = this.props.substeps.map((substep) => {
				return substep.getDefinition();
			});
		}

		for (const module of this.props.modules) {
			def[module.key] = module.getDefinition();
		}

		const durationDef = this.props.duration ? this.props.duration.getDefinition() : false;
		if (durationDef) {
			def.duration = durationDef;
		}

		if (this.props.definitionActor) {
			def.actor = this.props.definitionActor;
		}

		return def;
	}

	getTextFromDefinition(stepYaml) {
		if (stepYaml.step || stepYaml.text) {
			if (stepYaml.step && stepYaml.text) {
				throw new Error(
					'The "step" property is deprecated, and "text" is preferred, but both cannot be set'
				);
			}
			const content = stepYaml.text ? stepYaml.text : stepYaml.step;
			const preStep = arrayHelper.parseArray(content);
			return preStep.map((text) => this.parseStepText(text));
		}
		return [];
	}

	setState(definition) {

		this.props = {}; // wipes out pre-existing properties, so reload() can start over

		// Initiate the vars as empty.
		for (const prop of props.strings) {
			this.props[prop] = '';
		}

		// FIXME: This can't be in props.strings because the YAML input is "step" not "text", and in
		// getDefinition() it needs the proper YAML input name. Ultimately probably should change
		// "step" to "text".
		this.props.text = [];

		for (const prop of props.arrays) {
			this.props[prop] = [];
		}

		// handled differently by getDefinition()
		this.props.images = [];
		this.props.modules = [];
		this.props.substeps = [];

		this.props.raw = definition; // FIXME pretty sure not used anywhere. Remove. UniqueEWCVDS

		// Check if the step is a simple string
		if (typeof definition === 'string') {
			this.props.text = [this.parseStepText(definition)];
			return;
		}

		this.props.duration = new Duration(definition.duration);

		// Check for the title
		if (definition.title) {
			this.props.title = this.parseTitle(definition.title);
		}

		// Check for the text
		this.props.text = this.getTextFromDefinition(definition);

		// Check for images
		if (definition.images) {
			this.props.images = arrayHelper.parseArray(definition.images);

			for (let i = 0; i < this.props.images.length; i++) {
				if (typeof this.props.images[i] === 'string') {
					this.props.images[i] = { path: this.props.images[i] };
				}
				const image = this.props.images[i];

				if (image.width && !Number.isInteger(image.width) && image.width < 1) {
					throw new Error(`Width should be empty or a positive integer: ${image.path}`);
				}
				if (image.height && !Number.isInteger(image.height) && image.height < 1) {
					throw new Error(`Height should be empty or a positive integer: ${image.path}`);
				}
			}
		}

		const blocks = {
			// yaml prop    internal prop
			checkboxes: 'checkboxes',
			warning: 'warnings',
			caution: 'cautions',
			note: 'notes',
			comment: 'comments'
		};
		for (const yamlKey in blocks) {
			// user-generated YAML has different property names than internal JS property names
			const jsKey = blocks[yamlKey];
			this.props[jsKey] = this.parseBlock(definition[yamlKey]);
		}

		// Check for substeps
		if (definition.substeps) {
			this.props.substeps = this.parseSubsteps(definition.substeps);
		}

		for (const module of stepModules) {
			if (definition[module.key]) {
				if (!loadedModules[module.key]) {
					loadedModules[module.key] = require(`../writer/step-mods/${module.class}`);
				}

				// todo for any modules already in this.modules:
				// todo (1) add suggestions for modules to use along with this (module.suggest)
				// todo ... probably aggregate a list of suggestions, and after all modules loaded
				// todo ... then you can check that list against all modules
				// todo (2) add Errors for any module.reject
				// todo (3) add warnings for modules in neither module.suggest nor module.reject

				// instantiate StepModule
				this.props.modules.push(new loadedModules[module.key](this, definition));
			}
		}
	}

	parseBlock(textOrArray) {
		if (textOrArray) {
			return arrayHelper.parseArray(textOrArray).map(this.replaceTaskRoles.bind(this));
		} else {
			return [];
		}
	}

	/**
	 * Create a dict taskRolesMap to be able to determine role-->actor. Then
	 * create function replaceTaskRoles(text) to allow changing text like
	 * "{{role:crewB}}" into "EV1" if taskRolesMap['crewB'] === 'EV1'
	 *
	 * FIXME this seems excessive to do on every step
	 *
	 * @param  {Object} taskRoles  -  object of TaskRole objects. Example:
	 *                    taskRoles === {
	 *                      crewA: TaskRole{
	 *                        name: 'crewA',
	 *                        description: 'Crewmember exiting A/L first',
	 *                        actor: 'EV1'
	 *                      },
	 *                      crewB: TaskRole{
	 *                        name: 'crewB',
	 *                        description: 'Crewmember exiting A/L second',
	 *                        actor: 'EV2'
	 *                      }
	 *                    }
	 */
	mapTaskRolesToActor(taskRoles) {
		this.context.taskRoles = taskRoles;
		this.context.taskRolesMap = {};
		for (const role in taskRoles) {
			this.context.taskRolesMap[role] = taskRoles[role].actor;
		}
	}

	replaceTaskRoles(text) {
		for (const role in this.context.taskRolesMap) {
			text = text.replace(`{{role:${role}}}`, this.context.taskRolesMap[role]);
		}
		return text;
	}

	// fixme good docs
	setActors(actorIdOrIds = false, definition = false) { // FIXME WAS definitionActor = null) {

		// if no new value provided, don't change this.context.actorIdOrIds to a falsy value
		// fixme why?
		if (actorIdOrIds) {
			this.context.actorIdOrIds = arrayHelper.parseArray(actorIdOrIds);
		}

		// def.actor often undefined. Most steps do not explicitly
		// define who the actor  is. Instead, it's inferred from the Series the Step is within. If
		// it is defined, set it here. Otherwise, allow to be set to undefined. If definition not
		// supplied to this function, allow this.props.definitionActor to stay unchanged.
		if (definition) {
			this.props.definitionActor = definition.actor;
		}

		this.context.actors = arrayHelper.parseArray(
			this.props.definitionActor ? this.props.definitionActor : this.context.actorIdOrIds
		);
	}

	/**
	 * Return formatted title
	 *
	 * @param   {*} titleYaml YAML for the title
	 * @return  {*} array of substeps
     */
	parseTitle(titleYaml) {
		const title = this.replaceTaskRoles(titleYaml);

		const titleWarnings = [];

		// check if text like "(01:15)" is in the title and warn against it
		const regex = /\([\d\w]{2}:[\d\w]{2}\)/g;
		if (regex.test(title)) {
			titleWarnings.push(
				`Should not have "${title.match(regex)}" within title, use duration field`
			);
		}

		// check if duration is zero, and recommend adding duration
		if (this.props.duration.getTotalSeconds() === 0) {
			titleWarnings.push(
				'Should include "duration" field with hours, minutes, and/or seconds field'
			);
			titleWarnings.push('Example:\n     duration:\n       hours: 1\n       minutes: 15');
		}

		// warn if necessary
		if (titleWarnings.length > 0) {
			consoleHelper.warn(titleWarnings, `Title "${title}"`);
		}

		return title;
	}

	/**
	 * Return formatted step text
	 *
	 * @param   {*} stepTextYaml YAML for the step text
	 * @return  {Array} array of substeps
	 */
	parseStepText(stepTextYaml) {
		// return stepTextYaml;
		return this.replaceTaskRoles(stepTextYaml);
	}

	// this is a shim because Step now requires reference to the Series it resides within, and thus
	// so do Steps in substeps, e.g. Step.props.substeps === [Step, Step, ...]. At some point this
	// may change to Step.subseries === Subseries, where Subseries is related to Series (one
	// inherits from the other, or they share an ancestor).
	makeSubseries() {
		return {
			taskRoles: this.parent.taskRoles,
			seriesActors: this.parent.seriesActors
		};
	}

	/**
	 * Returns an array of substeps for the step, or an empty array if none are found.
	 *
	 * @param   {string|Array} substepsDefinition YAML for the substeps
	 * @return  {Array} array of substeps
	 */
	parseSubsteps(substepsDefinition) {

		const substeps = [];

		// Check for string. If string, it's not multiple substeps but a single
		// ! FIXME: Realistically why write a substep this way? Wouldn't you want it indented?
		if (typeof substepsDefinition === 'string') {
			substeps.push(new Step(substepsDefinition, this.makeSubseries()));

		// Check for array
		} else if (Array.isArray(substepsDefinition)) {
			for (const singleSubstepDef of substepsDefinition) {
				substeps.push(new Step(singleSubstepDef, this.makeSubseries()));
			}

		// Don't know how to process
		} else {
			throw new Error(
				`Expected substeps to be string or array. Instead got: ${JSON.stringify(substepsDefinition)}`
			);
		}

		return substeps;

	}

};
