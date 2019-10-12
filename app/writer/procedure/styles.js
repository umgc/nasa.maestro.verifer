'use strict';

const font = 'Arial';

module.exports = [
	{
		id: 'normal',
		name: 'Normal',
		basedOn: 'Normal',
		next: 'Normal',
		quickFormat: true,
		run: {
			font: font,
			size: 20
		},
		paragraph: {
			indent: {
				left: 45
			},
			spacing: {
				before: 45,
				after: 0
			}
		}
	},
	{
		id: 'listparagraph',
		name: 'List Paragraph',
		basedOn: 'List Paragraph',
		next: 'List Paragraph',
		quickFormat: true,
		run: {
			font: font,
			size: 20
		},
		paragraph: {
			spacing: {
				before: 45,
				after: 0
			}
		}
	},
	{
		id: 'strong',
		name: 'Strong',
		basedOn: 'Normal',
		next: 'Normal',
		quickFormat: true,
		run: {
			font: font,
			size: 20,
			bold: true
		},
		paragraph: {
			spacing: {
				before: 45,
				after: 0
			}
		}
	}
];
