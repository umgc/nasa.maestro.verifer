'use strict';

const React = require('react');
const uuidv4 = require('uuid/v4');

module.exports = {
	/**
	 * Function bolted onto PgtSet class to handle React elements
	 *
	 * @param {Function} getSetString    Function from PgtSet.js
	 * @param {Function} getValueString  Function from PgtSet.js
	 * @return {Object}                  Changes object in form from
	 *                                   StepModule.formatStepModAlterations()
	 *
	 * @this PgtSet
	 */
	doAlterStepReact: function(getSetString, getValueString) {

		const setText = (
			<React.Fragment key={uuidv4()}>
				{
					// Note: if there is step text, put first PGT text on a new line
					this.step.text.length ?
						this.step.text.map((text) => (<p key={uuidv4()}>{text}</p>)) :
						null
				}
				<strong>{getSetString(this)}</strong>
			</React.Fragment>
		);

		const valuesText = (
			<React.Fragment key={uuidv4()}>
				<br />
				<span>{getValueString(this)}</span>
			</React.Fragment>
		);

		return {
			body: this.formatStepModAlterations('APPEND', [setText, valuesText])
		};
	}

};
