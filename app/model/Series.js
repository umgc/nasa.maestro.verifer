'use strict';

const Step = require('./Step');
const subscriptionHelper = require('../helpers/subscriptionHelper');

module.exports = class Series {

	/**
	 *
	 * @param {Array} seriesActors - Array in form ['EV1'] for a single actor or
	 *                               ['EV1 + EV2', 'EV1', 'EV2'] for a joint actor Series.
	 * @param {Array} taskRoles
	 */
	constructor(seriesActors, taskRoles) {
		this.subscriberFns = {
			appendStep: [],
			deleteStep: [],
			insertStep: [],
			transferStep: []
		};
		this.seriesActors = seriesActors;
		this.taskRoles = taskRoles;
		this.steps = [];
	}

	getDefinition() {
		const def = [];
		for (const step of this.steps) {
			def.push(step.getDefinition());
		}
		return def;
	}

	// FIXME this is copied* directly from Step. Create "ReloadableModel" and make them extend it?
	// and that may be a better place than the subscriptionHelper.js file, except that maybe the
	// stateHandler logic needs it, too...?
	//
	// * copied, then refactored since Series has way more subscribable functions
	subscribe(subscriptionMethod, subscriberFn) {
		const unsubscribeFn = subscriptionHelper.subscribe(
			subscriberFn,
			this.subscriberFns[subscriptionMethod]
		);
		return unsubscribeFn;
	}

	modelFromDefOrModel(stepDefOrModel) {
		let stepModel;
		if (stepDefOrModel instanceof Step) {
			stepModel = stepDefOrModel;
		} else {
			stepModel = this.makeStep(stepDefOrModel);
		}
		return stepModel;
	}

	/**
	 *
	 * @param {Step|Object|string} stepDefOrModel - Either: (a) Step model to push to this Series,
	 *                                              or (b) plain Object step definition from which
	 *                                              to create a Step model and push to this series.
	 */
	appendStep(stepDefOrModel = false) {
		// console.log('Series.appendStep');
		const stepModel = this.modelFromDefOrModel(stepDefOrModel);
		this.steps.push(stepModel);
		stepModel.setContext(this);
		subscriptionHelper.run(this.subscriberFns.appendStep, this);
	}

	deleteStep(stepIndex) {
		// console.log('Series.deleteStep');
		this.steps.splice(stepIndex, 1);
		subscriptionHelper.run(this.subscriberFns.deleteStep, this);
	}

	insertStep(insertIndex, stepDefOrModel = false) {
		// console.log('Series.insertStep');
		const stepModel = this.modelFromDefOrModel(stepDefOrModel);
		this.steps.splice(insertIndex, 0, stepModel);
		stepModel.setContext(this);
		subscriptionHelper.run(this.subscriberFns.insertStep, this);
	}

	transferStep(removalIndex, destinationSeries, insertIndex) {
		// console.log('Series.transferStep');
		const [stepToTransfer] = this.steps.splice(removalIndex, 1);

		// transferring step within this Series
		if (destinationSeries === this) {
			console.log('transferring step within series');
			const realInsertIndex = removalIndex < insertIndex ?
				insertIndex :
				insertIndex + 1;

			this.steps.splice(realInsertIndex, 0, stepToTransfer);

		} else {
			console.log('transferring step from one series to another');

			// step was previously in another series which had different actors. Reset.
			stepToTransfer.setActors(destinationSeries.seriesActors);

			// transferring step from this Series to another Series
			destinationSeries.insertStep(insertIndex + 1, stepToTransfer);
			stepToTransfer.setContext(destinationSeries);
		}

		// FIXME is this right name? or should this be registered as an deleteStep? Or both?
		subscriptionHelper.run(this.subscriberFns.transferStep, this);

	}

	/**
	 * Make a Step based upon the context of this Series. Does not attach the step to the Series.
	 *
	 * @param {Object|string}  stepDefinition
	 * @return {Step}          Resulting step object
	 */
	makeStep(stepDefinition = {}) {
		return new Step(stepDefinition, this); // this.seriesActors, this.taskRoles);
	}

};
