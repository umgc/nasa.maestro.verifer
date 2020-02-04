'use strict';

const uuidv4 = require('uuid/v4');

const Step = require('./Step');
const Series = require('./Series');
const subscriptionHelper = require('../helpers/subscriptionHelper');

/**
 * Converts roles like "crewA" to actors like "EV1".
 *
 * Get either the real actor ID, or if it doesn't exist, return the actorIdGuess supplied.
 * if taskRoles[actorIdGuess] found, then it means actorIdGuess isn't a real actor and must be
 * replaced with whomever the procedure is passing in as an actor for the role.
 *
 * @param {Object} taskRoles     Object of TaskRole objects. See constructor for ConcurrentStep
 * @param {string} roleOrActorId  May be a proper actor ID like "EV1" or it may be a placeholder
 *                               "role" like "crewA". Procedures will then have to pass in
 *                               crewA === EV1 into the task, and it is the job of the
 *                               Task/ConcurrentStep/Step to attribute those steps to EV1 instead
 *                               of "crewA". Additionally steps may include text like
 *                               {{role:crewA}}. This is replaced within Step.
 * @return {string}
 */
function getRealActorId(taskRoles, roleOrActorId) {
	if (taskRoles[roleOrActorId]) {
		return taskRoles[roleOrActorId].actor;
	} else {
		return roleOrActorId;
	}
}

/**
 * Return main ID for an actorIdGuess and the list of IDs of all IDs
 * @param {string} roleOrActorOrJoint  May be an actor ID like "EV1" or may be a role like "crewA".
 *                                     Also may include joint actors and/or roles, like:
 *                                       roleOrActorOrJoint === "someRole + someActor + anotherRole"
 *                                     See details in getRealActorId()
 * @param  {Object} taskRoles    Object of TaskRole objects. See constructor for ConcurrentStep
 * @return {Object}              Examples:
 *                                 actorIdGuess = crewA --> { id: 'EV1', idOrIds: 'EV1' }
 *                                 actorIdGuess = EV1+EV2 --> {
 *                                   id: 'EV1 + EV2',
 *                                   idOrIds: ['EV1 + EV2', 'EV1, 'EV2']
 *                                 }
 *                                 actorIdGuess = crewA + crewB --> {
 *                                   id: 'EV1 + EV2',
 *                                   idOrIds: ['EV1 + EV2', 'EV1, 'EV2']
 *                                 }
 */
function getActorInfo(roleOrActorOrJoint, taskRoles) {

	let idOrIds,
		id;

	// check for joint actors
	if (roleOrActorOrJoint.indexOf('+') !== -1) {

		// split the actors/roles on +, then replace things like "crewB" with "EV2" (if
		// EV2 is assigned to crewB role)
		idOrIds = roleOrActorOrJoint.split('+').map((str) => {
			return getRealActorId(taskRoles, str.trim());
		});

		// recreate ID by gluing back together
		id = idOrIds.join(' + ');

		idOrIds.unshift(id); // stick the composite back on the front. TODO necessary?
	} else {
		idOrIds = getRealActorId(taskRoles, roleOrActorOrJoint);
		id = idOrIds;
	}

	return { id: id, idOrIds: idOrIds };
}

module.exports = class ConcurrentStep {

	/**
	 * Create new ConcurrentStep
	 *
	 * @param  {Object} definition  An object representing a set of steps
	 *
	 *                  Examples:
	 *                    definition === {
	 *                      simo: {
	 *                        IV: [ Step, Step, Step ],
	 *                        crewA: [ Step ],
	 *                        crewB: Step not in array
	 *                      }
	 *                    }
	 *                    definition === {
	 *                        IV: [ Step, Step, Step ]
	 *                            <-- can't have second actor here in non-simo case
	 *                    }
	 *                    definition === {
	 *                        IV: Step not in array
	 *                    }
	 * @param  {Task} parent  The Task object this object resides within
	 */
	constructor(definition, parent) {
		this.subscenes = {};
		this.uuid = uuidv4();
		this.subscriberFns = {
			setState: []
		};
		this.setContext(parent);
		this.setState(definition);
	}

	setContext(parent) {
		this.parent = parent;
		this.taskRoles = parent.rolesDict;
	}

	getDefinition() {
		const def = {};
		for (const actor in this.subscenes) {
			const seriesDef = this.subscenes[actor].getDefinition();
			if (Array.isArray(seriesDef) && seriesDef.length > 0) {
				def[actor] = seriesDef;
			}
		}
		const numActors = Object.keys(def).length;
		if (numActors === 0) {
			return false;
		} else if (numActors > 1) {
			return { simo: def };
		}
		return def;
	}

	subscribe(subscriptionMethod, subscriberFn) {
		const unsubscribeFn = subscriptionHelper.subscribe(
			subscriberFn,
			this.subscriberFns[subscriptionMethod]
		);
		return unsubscribeFn;
	}

	setState(definition) {

		for (const actor in this.subscenes) {
			delete this.subscenes[actor];
		}

		// First, check if this is a simo
		if (definition.simo) {

			// Iterate over they keys (which are actor roles)
			for (const actorIdGuess in definition.simo) {
				this.handleActorSteps(definition, actorIdGuess);
			}

		// Not a simo, so just an actor role
		} else {

			// Get the actor role
			if (Object.keys(definition).length !== 1) {
				throw new Error(`Expected a single actor role, but instead got ${JSON.stringify(definition)}`);
			}

			const actorIdGuess = Object.keys(definition)[0];

			this.handleActorSteps(definition, actorIdGuess);
		}

		subscriptionHelper.run(this.subscriberFns.setState, this);
	}

	handleActorSteps(concurrentStepYaml, roleOrActorOrJoint) {

		// if .simo exists, use it. Otherwise it's not a simo block and directly access actor
		const actorStepsDefinition = concurrentStepYaml.simo ?
			concurrentStepYaml.simo[roleOrActorOrJoint] :
			concurrentStepYaml[roleOrActorOrJoint];

		const seriesKey = this.addSeries(roleOrActorOrJoint);
		const series = this.subscenes[seriesKey];

		if (typeof actorStepsDefinition === 'string') {
			series.appendStep(actorStepsDefinition);

		} else if (Array.isArray(actorStepsDefinition)) {

			for (var stepDefinition of actorStepsDefinition) {
				series.appendStep(stepDefinition);
			}

		// Don't know how to process this
		} else {
			throw new Error(
				`Was expecting either steps or string for actor. Instead found: ${JSON.stringify(actorStepsDefinition)}`
			);
		}

	}

	/**
	 * FIXME: Handle with setState?
	 * @param {string} roleOrActorOrJoint - The role, actor, or joint (aRole + anActor + another)
	 *                                      the Series belongs to. From this, the key in the
	 *                                      this.subscenes object can be determined.
	 * @return {string}                   - The key of the new Series in this.subscenes
	 */
	addSeries(roleOrActorOrJoint) {
		const actorInfo = getActorInfo(roleOrActorOrJoint, this.taskRoles);
		this.subscenes[actorInfo.id] = new Series(actorInfo.idOrIds, this);
		return actorInfo.id;
	}

	getNumStepsPriorToSeries(series) {
		const activityColumnKeys = this.parent.getColumns();
		const seriesKeys = Object.keys(this.subscenes);
		const actorKeyToSeriesKey = {};
		for (const key of seriesKeys) {
			if (activityColumnKeys.indexOf(key) > -1) {
				actorKeyToSeriesKey[key] = key;
			} else {
				key.split('+').map((actor) => {
					const a = actor.trim();
					actorKeyToSeriesKey[a] = key;
				});
			}
			// FIXME this doesn't account for a series not directly attached to a column, e.g. if
			// you made an SSRMS series that got mapped onto the IV column. The UI won't support
			// that but the maestro yaml spec will.
		}

		const completed = [];
		let totalSteps = 0;
		for (const key of activityColumnKeys) {
			let checkSeries = this.subscenes[key];
			if (!checkSeries) {
				const jointActorKey = actorKeyToSeriesKey[key];
				if (completed.indexOf(jointActorKey) > -1) {
					break; // already did this one, move on
				}
				checkSeries = this.subscenes[jointActorKey];
			}

			if (series !== checkSeries) {
				totalSteps += checkSeries.getTotalSteps();
			} else {
				return totalSteps;
			}
		}
		throw new Error(`Series ${series.uuid} not within ConcurrentStep ${this.uuid}`);
	}

	getTotalSteps() {
		let totalSteps = 0;
		for (const seriesKey in this.subscenes) {
			totalSteps += this.subscenes[seriesKey].getTotalSteps();
		}
		return totalSteps;
	}

};
