'use strict';

const React = require('react');
const uuidv4 = require('uuid/v4');

function reactColor(text, color) {
	return (<span key={uuidv4()} style={{ fontWeight: 'bold', color: color }}>{text}</span>);
}

const transforms = {
	'{{CHECK}}': (<React.Fragment key={uuidv4()}>✓</React.Fragment>),
	'{{CHECKBOX}}': (<React.Fragment key={uuidv4()}>☐</React.Fragment>),
	'{{CHECKEDBOX}}': (<React.Fragment key={uuidv4()}>☑</React.Fragment>),
	'{{LEFT}}': (<React.Fragment key={uuidv4()}>←</React.Fragment>),
	'{{UP}}': (<React.Fragment key={uuidv4()}>↑</React.Fragment>),
	'{{RIGHT}}': (<React.Fragment key={uuidv4()}>→</React.Fragment>),
	'{{DOWN}}': (<React.Fragment key={uuidv4()}>↓</React.Fragment>)
};

function reactStringsToJSX(transformArr) {
	return transformArr.map((cur) => {
		return typeof cur === 'string' ?
			(<React.Fragment key={uuidv4()}>{cur}</React.Fragment>) :
			cur;
	});
}

module.exports = {
	reactColor,
	reactStringsToJSX,
	transforms
};
