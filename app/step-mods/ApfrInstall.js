'use strict';

const StepModule = require('./StepModule');
const docx = require('docx');

const validSettings = {
	clock: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
	pitch: ['FF', 'GG', 'HH', 'II', 'JJ', 'KK', 'LL', 'MM', 'NN', 'OO', 'PP',
		'QQ', 'RR', 'SS', 'TT', 'UU', 'VV', 'WW', 'XX', 'YY', 'ZZ'],
	roll: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L'],
	yaw: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
};

function validateSetting(setting, type) {
	if (validSettings[type].indexOf(setting) === -1) {
		throw new Error(`Setting ${setting} is not valid for APFR ${type} joint`);
	}
	return setting;
}

const specialWIFs = ['SSRMS', 'WIFEX'];

function validateWIF(wif) {
	const standard = /\w+ WIF \d+/;
	if (specialWIFs.indexOf(wif) !== -1 || standard.test(wif)) {
		return wif;
	} else {
		throw new Error(`WIF "${wif}" is not valid. Must be in ${specialWIFs} or match form "<element> WIF <number>"`);
	}
}

function getSettings(instance) {
	return [instance.clock, instance.pitch, instance.roll, instance.yaw];
}

module.exports = class ApfrInstall extends StepModule {

	constructor(step, stepYaml) {
		super();
		this.key = 'apfr.install';
		this.step = step;
		this.raw = stepYaml;

		// todo also accept torque/speed/etc separately (e.g. accept an obj instead of string)
		const settingsString = stepYaml[this.key].settings;

		// strip any [ or ] since people may be used to wrapping settings in brackets,
		// but that isn't necessary anymore
		const parts = settingsString.replace(/\[/g, '').replace(/\]/g, '')
			.split(',')
			.map((val) => {
				return val.trim();
			});

		this.clock = validateSetting(parts[0], 'clock');
		this.pitch = validateSetting(parts[1], 'pitch');
		this.roll = validateSetting(parts[2], 'roll');
		this.yaw = validateSetting(parts[3], 'yaw');

		this.wif = validateWIF(stepYaml[this.key].wif);
	}

	getDefinition() {
		return {
			settings: getSettings(this).join(','),
			wif: this.wif
		};
	}

	alterStepBase() {
		return {
			body: {
				content: `Install APFR in ${this.wif} [${getSettings(this).join(',')}]`,
				type: 'APPEND'
			}
		};
	}

	alterStepDocx() {

		const changes = {
			body: {
				content: [],
				type: 'APPEND'
			},
			checkboxes: {
				// push some checkboxes onto the front
				content: [
					'Pull/twist test',
					'Black-on-black',
					'pitch knob locked, can be depressed'
				],
				type: 'PREPEND'
			}
		};

		const installAPFR = new docx.TextRun({
			text: `Install APFR in ${this.wif} `
		});

		if (this.step.text.length) {
			// if there is step text, put first APFR text on a new line
			installAPFR.break();
		}
		changes.body.content.push(installAPFR);

		changes.body.content.push(
			new docx.TextRun({
				text: `[${getSettings(this).join(',')}]`,
				bold: true
			})
		);

		return changes;
	}

};
