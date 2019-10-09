'use strict';

function htmlColor(color) {
	return `<span style="font-weight:bold;color:${color.toLowerCase()};">${color}</span>`;
}

var transforms = [
	{
		text: '{{CHECK}}',
		html: '✓',
		docx: '✓'
	},
	{
		text: '{{CHECKBOX}}',
		html: '☐',
		docx: '☐'
	},
	{
		text: '{{CHECKEDBOX}}',
		html: '☑',
		docx: '☑'
	},
	{
		text: '{{LEFT}}',
		html: '←',
		docx: '←'
	},
	{
		text: '{{RIGHT}}',
		html: '→',
		docx: '→'
	},
	{
		text: 'ANCHOR',
		html: '<strong>ANCHOR</strong>',
		docx: 'ANCHOR'
	}
];
var colors = [
	'GREEN',
	'RED',
	'YELLOW',
	'BLACK',
	'BLUE',
	'PURPLE',
	'ORANGE'
];
for (const color of colors) {
	transforms.push({
		text: color,
		html: htmlColor(color),
		docx: color
	});
}

function getNextTransform(text, xformFormat) {
	for (const xform of transforms) {
		if (text.indexOf(xform.text) !== -1) {
			const searchStart = text.indexOf(xform.text);
			const searchEnd = searchStart + xform.text.length;
			const result = {
				prefix: text.substring(0, searchStart),
				transform: xform[xformFormat],
				suffix: text.substring(searchEnd)
			};
			if (typeof result.transform === 'function') {
				result.transform = result.transform(xform.text);
			}
			return result;
		}
	}
	return false;
}

function doTransform(text, xformFormat) {
	if (!text) {
		return [];
	}
	const transformed = getNextTransform(text, xformFormat);
	if (transformed) {
		const result = doTransform(transformed.prefix, xformFormat); // recurse until no prefix
		result.push(transformed.transform);
		result.push(...doTransform(transformed.suffix, xformFormat)); // recurse until no suffix
		return result;
	} else {
		return [text];
	}
}

module.exports = class TextTransform {

	constructor(format) {
		const validFormats = ['html', 'docx'];
		if (validFormats.indexOf(format) === -1) {
			throw new Error('new TextWriter(format) requires format to be in ${validFormats.toString()}');
		}
		this.format = format;
	}

	transform(text) {
		return doTransform(text, this.format);
	}

	/**
	 * Exposed outside module purely for testing
	 * @param {string} color string like "RED"
	 * @return {string} HTML like <span style="font-weight:bold;color:red;">RED</span>
	 */
	htmlColor(color) {
		return htmlColor(color);
	}
};
