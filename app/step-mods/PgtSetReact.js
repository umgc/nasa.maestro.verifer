'use strict';

const React = require('react');
const uuidv4 = require('uuid/v4');

module.exports = {
	doAlterStepReact: function(getSetString, getValueString) {

		const changes = {
			body: {
				content: [],
				type: 'APPEND'
			}
		};

		// ! FIXME this shouldn't need to be here anymore. Handle higher up
		// if (this.step.text) {
		// if (typeof this.step.text === 'string') {
		// children.push(...this.transform(this.step.text));
		// } else if (Array.isArray(this.step.text)) {
		// for (let thing of this.step.text) {
		// thing = this.transform(thing);
		// }
		// } else if (typeof this.step.text === 'object'
		// && true /* FIXME: replace true with real check for react component */) {
		// children.push(this.step.text); // FIXME: make sure has key?
		// }
		// }

		// Note: if there is step text, put first PGT text on a new line
		changes.body.content.push(
			(
				<React.Fragment key={uuidv4()}>
					{
						this.step.text.length ?
							this.step.text.map((text) => (<p key={uuidv4()}>{text}</p>)) :
							null
					}
					<strong>{getSetString(this)}</strong>
				</React.Fragment>
			)
		);

		changes.body.content.push(
			(
				<React.Fragment key={uuidv4()}>
					<br />
					<span>{getValueString(this)}</span>
				</React.Fragment>
			)
		);

		return changes;
	}

};
