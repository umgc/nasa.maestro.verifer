'use strict';

const React = require('react');
const docx = require('docx');
const arrayHelper = require('../helpers/arrayHelper');

function htmlColor(text, color) {
	return `<span style="font-weight:bold;color:${color};">${text}</span>`;
}

function docxColor(text, color) {
	return new docx.TextRun({
		text: text,
		bold: true,
		color: color
	});
}

function reactColor(text, color) {
	return (<span style={{ fontWeight: 'bold', color: color }}>{text}</span>);
}

const transforms = [
	{
		text: '{{CHECK}}',
		html: '✓',
		docx: '✓',
		react: (<React.Fragment>✓</React.Fragment>)
	},
	{
		text: '{{CHECKBOX}}',
		html: '☐',
		docx: () => {
			return new docx.SymbolRun('F071');
		},
		react: (<React.Fragment>☐</React.Fragment>)
	},
	{
		text: '{{CHECKEDBOX}}',
		html: '☑',
		docx: '☑',
		react: (<React.Fragment>☑</React.Fragment>)
	},
	{
		text: '{{LEFT}}',
		html: '←',
		docx: new docx.SymbolRun('F0DF'),
		react: (<React.Fragment>←</React.Fragment>)
	},
	{
		text: '{{UP}}',
		html: '↑',
		docx: new docx.SymbolRun('F0E1'),
		react: (<React.Fragment>↑</React.Fragment>)
	},
	{
		text: '{{RIGHT}}',
		html: '→',
		docx: new docx.SymbolRun('F0E0'),
		react: (<React.Fragment>→</React.Fragment>)
	},
	{
		text: '{{DOWN}}',
		html: '↓',
		docx: new docx.SymbolRun('F0E2'),
		react: (<React.Fragment>↓</React.Fragment>)
	}
];
const colors = [
	{ text: 'GREEN', color: 'green' },
	{ text: 'RED', color: 'red' },
	{ text: 'YELLOW', color: '#FFC000' },
	{
		text: [
			'BLACK',
			'ANCHOR',
			'GO'
		],
		color: 'black'
	},
	{ text: 'BLUE', color: 'blue' },
	{ text: 'PURPLE', color: 'purple' },
	{ text: 'ORANGE', color: 'orange' }
];
for (const item of colors) {
	const texts = arrayHelper.parseArray(item.text);
	for (const text of texts) {
		transforms.push({
			text: text,
			html: htmlColor(text, item.color),
			docx: docxColor(text, item.color),
			react: reactColor(text, item.color)
		});
	}
}

function splitStringAndTransform(text, xform, xformFormat) {

	// In `text`, get the start and end index of xform.text
	const searchStart = text.indexOf(xform.text);
	const searchEnd = searchStart + xform.text.length;

	// prefix and suffix are strings before and after xform.text. Transform xform.text
	const result = {
		prefix: text.substring(0, searchStart),
		transformed: xform[xformFormat],
		suffix: text.substring(searchEnd)
	};

	// if result.transform isn't actually the tranformed result, but instead is a function, use that
	// function to generate the result.
	if (typeof result.transformed === 'function') {
		result.transformed = result.transformed(xform.text);
	}

	return result;
}

function findNextTransform(text, xformFormat) {
	for (const xform of transforms) {
		if (text.indexOf(xform.text) !== -1) {
			return splitStringAndTransform(text, xform, xformFormat);
		}
	}
	return false;
}

function doTransform(text, xformFormat) {
	if (!text) {
		return [];
	}
	const transform = findNextTransform(text, xformFormat);
	if (transform) {
		const result = doTransform(transform.prefix, xformFormat); // recurse until no prefix
		result.push(transform.transformed);
		result.push(...doTransform(transform.suffix, xformFormat)); // recurse until no suffix
		return result;
	} else {
		return [text];
	}
}

function docxStringsToTextRuns(transformArr) {
	return transformArr.map((cur) => {
		return typeof cur === 'string' ? new docx.TextRun(cur) : cur;
	});
}

function reactStringsToJSX(transformArr) {
	return transformArr.map((cur) => {
		return typeof cur === 'string' ? (<React.Fragment>{cur}</React.Fragment>) : cur;
	});
}

module.exports = class TextTransform {

	constructor(format) {
		const validFormats = ['html', 'docx', 'react'];
		if (validFormats.indexOf(format) === -1) {
			throw new Error('new TextWriter(format) requires format to be in ${validFormats.toString()}');
		}
		this.format = format;
	}

	transform(text) {
		let transform = doTransform(text, this.format);
		if (this.format === 'docx') {
			transform = docxStringsToTextRuns(transform);
		} else if (this.format === 'react') {
			transform = reactStringsToJSX(transform);
		}
		return transform;
	}

	/**
	 * Exposed outside module purely for testing
	 * @param {string} text string like "RED"
	 * @param {string} color string like "red". If omitted, use `text` as the color.
	 * @return {string} HTML like <span style="font-weight:bold;color:red;">RED</span>
	 */
	htmlColor(text, color) {
		if (!color) {
			color = text.toLowerCase();
		}
		return htmlColor(text, color);
	}
};
