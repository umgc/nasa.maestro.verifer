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

		return {
			body: this.formatStepModAlterations(
				'APPEND',
				(
					<React.Fragment key={uuidv4()}>
						<strong>{getSetString(this)}</strong>
						<br />
						<span>{getValueString(this)}</span>
					</React.Fragment>
				)
			)

		};
	}

};
