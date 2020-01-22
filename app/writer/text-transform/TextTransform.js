'use strict';

const docx = require('docx');
const arrayHelper = require('../../helpers/arrayHelper');
let reactTextTransform; // only load this when needed, because JSX.

/**
 * Generate bold/colored text in a <span> for HTML
 * @param {string} text   Content of the text
 * @param {string} color  Color of the text
 * @return {string}
 */
function htmlColor(text, color) {
	return `<span style="font-weight:bold;color:${color};">${text}</span>`;
}

/**
 * Generate bold/colored text for DOCX
 * @param {string} text   Content of the text
 * @param {string} color  Color of the text
 * @return {docx.TextRun}
 */
function docxColor(text, color) {
	return new docx.TextRun({
		text: text,
		bold: true,
		color: color
	});
}

const transforms = [
	{
		text: '{{CHECK}}',
		html: '✓',
		docx: '✓',
		react: null // see ReactTextTransform
	},
	{
		text: '{{CHECKBOX}}',
		html: '☐',
		docx: () => {
			return new docx.SymbolRun('F071');
		},
		react: null // see ReactTextTransform
	},
	{
		text: '{{CHECKEDBOX}}',
		html: '☑',
		docx: '☑',
		react: null // see ReactTextTransform
	},
	{
		text: '{{LEFT}}',
		html: '←',
		docx: new docx.SymbolRun('F0DF'),
		react: null // see ReactTextTransform
	},
	{
		text: '{{UP}}',
		html: '↑',
		docx: new docx.SymbolRun('F0E1'),
		react: null // see ReactTextTransform
	},
	{
		text: '{{RIGHT}}',
		html: '→',
		docx: new docx.SymbolRun('F0E0'),
		react: null // see ReactTextTransform
	},
	{
		text: '{{DOWN}}',
		html: '↓',
		docx: new docx.SymbolRun('F0E2'),
		react: null // see ReactTextTransform
	}
];

/**
 * Add colors to list of transforms. Will add color transforms:
 *
 *  {
 *    text: 'BLACK',
 *    html: '<span style="font-weight:bold;color:black;">BLACK</span>',
 *    docx: TextRun {...}
 *    react: (<span style="font-weight:bold;color:black;">BLACK</span>) // <-- only if react in use
 *  }
 */
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
const colorPointers = {};
for (const item of colors) {
	const texts = arrayHelper.parseArray(item.text);
	for (const text of texts) {
		transforms.push({
			text: text,
			html: htmlColor(text, item.color),
			docx: docxColor(text, item.color)
		});
		colorPointers[text] = transforms.length - 1; // for React transforms to easily be added
	}
}

/**
 * Splits text at a transformable substring and returns the text before and after the substring
 * unchanged. The transformable text is transformed.
 *
 * @param {string} text
 * @param {Object} xform        Element of 'transforms' array. Example:
 *                                {
 *                                  text: '{{CHECK}}',
 *                                  html: '✓',
 *                                  docx: '✓',
 *                                  react: null // see ReactTextTransform
 *                                }
 * @param {string} xformFormat  Format like docx, html, react
 * @return {Object}             Example: { prefix: ..., transformed: ..., suffix: ... }
 */
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

/**
 * Find next transform, perform it or return false
 *
 * @param {string} text String to find transforms in
 * @param {string} xformFormat Transform format like html, docx, react
 * @return {Object|boolean}  False if no transformable substrings found in text. Otherwise return
 *                           output of splitStringAndTransform(). See those docs.
 */
function findNextTransform(text, xformFormat) {
	for (const xform of transforms) {
		if (text.indexOf(xform.text) !== -1) {
			return splitStringAndTransform(text, xform, xformFormat);
		}
	}
	return false;
}

/**
 * Perform all transforms on text. This function is called recursively until no more transforms are
 * found.
 *
 * @param {string} text Text on which to perform all transforms
 * @param {string} xformFormat Transform format like html, docx, react
 * @return {Array}
 */
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

/**
 * Convert all strings to docx.TextRun objects.
 *
 * When the TextTransform class is complete transforming a string for the docx transform type, the
 * array outputted must not include any strings.
 *
 * @param {Array} transformArr  Array which may include docx.TextRun objects and strings (and
 *                              perhaps other docx types).
 * @return {Array}              Array which shall not include strings
 */
function docxStringsToTextRuns(transformArr) {
	return transformArr.map((cur) => {
		return typeof cur === 'string' ? new docx.TextRun(cur) : cur;
	});
}

module.exports = class TextTransform {

	constructor(format) {
		const validFormats = ['html', 'docx', 'react'];
		if (validFormats.indexOf(format) === -1) {
			throw new Error('new TextWriter(format) requires format to be in ${validFormats.toString()}');
		}
		this.format = format;

		// modify transforms to include React transforms if (1) using React and (2) prior
		// TextTransform objects haven't already modified them
		if (this.format === 'react' && !reactTextTransform) {
			// console.log('Creating React text transforms');
			const ReactTextTransform = require('./ReactTextTransform');

			// instantiate in module context
			reactTextTransform = new ReactTextTransform(transforms, colors, colorPointers);
		}
	}

	transform(text) {
		let transform = doTransform(text, this.format);
		if (this.format === 'docx') {
			transform = docxStringsToTextRuns(transform);
		} else if (this.format === 'react') {
			transform = reactTextTransform.reactStringsToJSX(transform);
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
