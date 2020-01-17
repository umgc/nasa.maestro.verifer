/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';
const docx = require('docx');

const StepModuleTester = require('../../../test/helpers/StepModuleTester');

const goodSettings = [
	{
		actual: { 'apfr.install': {
			settings: '6, PP, F, 6',
			wif: 'SSRMS'
		} },
		expected: {
			properties: {
				clock: '6',
				pitch: 'PP',
				roll: 'F',
				yaw: '6',
				wif: 'SSRMS'
			},
			alterStepBase: {
				body: {
					content: ['Install APFR in SSRMS [6,PP,F,6]'],
					type: 'APPEND'
				}
			}
		},
		module: null
	},
	{
		actual: { 'apfr.install': {
			settings: '12, RR, G, 11',
			wif: 'P6 WIF 1'
		} },
		expected: {
			properties: {
				clock: '12',
				pitch: 'RR',
				roll: 'G',
				yaw: '11',
				wif: 'P6 WIF 1'
			},
			alterStepBase: {
				body: {
					content: ['Install APFR in P6 WIF 1 [12,RR,G,11]'],
					type: 'APPEND'
				}
			}
		},
		module: null
	}
];

const badSettings = [
	{ 'apfr.install': { settings: '13, PP, F, 6', wif: 'SSRMS' } },
	{ 'apfr.install': { settings: '12, AA, F, 6', wif: 'P1 WIF 1' } },
	{ 'apfr.install': { settings: '12, PP, Z, 6', wif: 'P1 WIF 01' } },
	{ 'apfr.install': { settings: '12, PP, F, 0', wif: 'P1 WIF 01' } },
	{ 'apfr.install': { settings: '12, PP, F, 13', wif: 'WIF 1' } }
];

const tester = new StepModuleTester('apfr.install');
tester.addGoodInputs(goodSettings);
tester.addBadInputs(badSettings);

describe('ApfrInstall', function() {
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
