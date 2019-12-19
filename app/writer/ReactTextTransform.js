'use strict';

const React = require('react');
const uuidv4 = require('uuid/v4');
const arrayHelper = require('../helpers/arrayHelper');

const reactTransforms = {
	'{{CHECK}}': (<React.Fragment key={uuidv4()}>✓</React.Fragment>),
	'{{CHECKBOX}}': (<React.Fragment key={uuidv4()}>☐</React.Fragment>),
	'{{CHECKEDBOX}}': (<React.Fragment key={uuidv4()}>☑</React.Fragment>),
	'{{LEFT}}': (<React.Fragment key={uuidv4()}>←</React.Fragment>),
	'{{UP}}': (<React.Fragment key={uuidv4()}>↑</React.Fragment>),
	'{{RIGHT}}': (<React.Fragment key={uuidv4()}>→</React.Fragment>),
	'{{DOWN}}': (<React.Fragment key={uuidv4()}>↓</React.Fragment>)
};

module.exports = class ReactTextTransform {

	constructor(baseTransforms, colors, colorPointers) {

		for (const item of colors) {
			const texts = arrayHelper.parseArray(item.text);
			for (const text of texts) {
				// console.log(`Adding react color transform for ${text} --> ${item.color}`);
				baseTransforms[colorPointers[text]].react = this.reactColor(text, item.color);
			}
		}

		for (const xform of baseTransforms) {
			// skip over those already added above (colors)
			if (!xform.react) {
				// console.log(`Attempting to add react transfor for ${xform.text}...`);
				if (reactTransforms[xform.text]) {
					// console.log(`...added ${xform.text}`);
					xform.react = reactTransforms[xform.text];
				}
			}
		}

	}

	reactColor(text, color) {
		return (<span key={uuidv4()} style={{ fontWeight: 'bold', color: color }}>{text}</span>);
	}

	reactStringsToJSX(transformArr) {
		return transformArr.map((cur) => {
			return typeof cur === 'string' ?
				(<React.Fragment key={uuidv4()}>{cur}</React.Fragment>) :
				cur;
		});
	}

};
