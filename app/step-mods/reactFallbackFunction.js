'use strict';
const React = require('react');
const uuidv4 = require('uuid/v4');

module.exports = function(stepModule) {
	if (stepModule.alterStepHtml && typeof stepModule.alterStepHtml === 'function') {
		return (
			<span key={uuidv4()} dangerouslySetInnerHTML={{ __html: stepModule.alterStepHtml() }}>
			</span>
		);
	} else if (stepModule.alterStepBase && typeof stepModule.alterStepBase === 'function') {
		return (<React.Fragment key={uuidv4()}>{stepModule.alterStepBase()}</React.Fragment>);
	} else {
		throw new Error(
			'Step module must implement alterStepReact, alterStepHtml, or alterStepBase');
	}
};
