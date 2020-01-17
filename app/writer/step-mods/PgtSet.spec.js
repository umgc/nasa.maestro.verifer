/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const docx = require('docx');

const StepModuleTester = require('../../../test/helpers/StepModuleTester');

const goodSettings = [
	{
		actual: { 'pgt.set': 'B7, CCW2' },
		expected: {
			properties: {
				torqueCollar: 'B7',
				speedCollar: 'CCW2',
				mtlCollar: null,
				socket: null
			},
			alterStepBase: {
				body: {
					content: ['PGT [B7, CCW2] (25.5 ft-lb, 30 RPM, MTL 30.5)'],
					type: 'APPEND'
				}
			}
		},
		module: null
	},
	{
		actual: { 'pgt.set': 'B1, CCW1, 6" Wobble' },
		expected: {
			properties: {
				torqueCollar: 'B1',
				speedCollar: 'CCW1',
				mtlCollar: null,
				socket: '6" Wobble'
			},
			alterStepBase: {
				body: {
					content: ['PGT [B1, CCW1] (12.0 ft-lb, 10 RPM, MTL 30.5) - 6" Wobble'],
					type: 'APPEND'
				}
			}
		},
		module: null
	},
	{
		actual: { 'pgt.set': 'A7, CW2, 30.5' },
		expected: {
			properties: {
				torqueCollar: 'A7',
				speedCollar: 'CW2',
				mtlCollar: '30.5',
				socket: null
			},
			alterStepBase: {
				body: {
					content: ['PGT [A7, CW2, 30.5] (9.2 ft-lb, 30 RPM, MTL 30.5)'],
					type: 'APPEND'
				}
			}
		},
		module: null
	},
	{
		actual: { 'pgt.set': 'B1, CW1, 2.5' },
		expected: {
			properties: {
				torqueCollar: 'B1',
				speedCollar: 'CW1',
				mtlCollar: '2.5',
				socket: null
			},
			alterStepBase: {
				body: {
					content: ['PGT [B1, CW1, 2.5] (12.0 ft-lb, 10 RPM, MTL 2.5)'],
					type: 'APPEND'
				}
			}
		},
		module: null
	},
	{
		actual: { 'pgt.set': 'B7, CW2, 2.5, 7/16 x 18" Wobble Socket' },
		expected: {
			properties: {
				torqueCollar: 'B7',
				speedCollar: 'CW2',
				mtlCollar: '2.5',
				socket: '7/16 x 18" Wobble Socket'
			},
			alterStepBase: {
				body: {
					content: ['PGT [B7, CW2, 2.5] (25.5 ft-lb, 30 RPM, MTL 2.5) - 7/16 x 18" Wobble Socket'],
					type: 'APPEND'
				}
			}
		},
		module: null
	},
	{
		// hanging comma doesn't cause error
		actual: { 'pgt.set': 'B7, CW2, ' /* <-- note hanging comma & space */ },
		expected: {
			properties: {
				torqueCollar: 'B7',
				speedCollar: 'CW2',
				mtlCollar: null,
				socket: null
			},
			alterStepBase: {
				body: {
					content: ['PGT [B7, CW2] (25.5 ft-lb, 30 RPM, MTL 30.5)'],
					type: 'APPEND'
				}
			}
		},
		module: null
	}
];

const badSettings = [
	{ 'pgt.set': 'B9, CCW3' },
	{ 'pgt.set': 'C7, CCW3' },
	{ 'pgt.set': 'asdf, CCW3, 30.5' },
	{ 'pgt.set': 'B7, CCW4' },
	{ 'pgt.set': 'B7, CCW0' },
	{ 'pgt.set': 'B7, asdf, 30.5' },
	{ 'pgt.set': 'B7, CCW2, 1.0' }
];

const tester = new StepModuleTester('pgt.set');
tester.addGoodInputs(goodSettings);
tester.addBadInputs(badSettings);

describe('PgtSet', function() {

	describe('constructor', function() {
		tester.testConstructor();
	});

	describe('alterStepBase()', function() {
		tester.testAlterStepBase();
	});

	describe('alterStepDocx()', function() {
		tester.testAlterStepDocx({ body: { content: docx.TextRun, type: 'APPEND' } });
	});

});
