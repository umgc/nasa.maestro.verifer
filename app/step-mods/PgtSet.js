'use strict';

const StepModule = require('./StepModule');
const docx = require('docx');

const mtl = [
	'2.5',
	'5.5',
	'10.5',
	'15.5',
	'23.5',
	'30.5'
];

const torque = {
	A1: '2.5',
	A2: '3.8',
	A3: '4.8',
	A4: '6.3',
	A5: '7.0',
	A6: '8.3',
	A7: '9.2',
	B1: '12.0',
	B2: '16.0',
	B3: '18.4',
	B4: '19.4',
	B5: '22.0',
	B6: '24.0',
	B7: '25.5'
};

const speed = {
	CCW3: 60,
	CCW2: 30,
	CCW1: 10,
	CW1: 10,
	CW2: 30,
	CW3: 60
};

module.exports = class PgtSet extends StepModule {

	constructor(step, stepYaml) {
		super();
		this.key = 'pgt.set';
		this.step = step;
		this.raw = stepYaml;

		// todo also accept torque/speed/etc separately (e.g. accept an obj instead of string)
		const inputString = stepYaml[this.key];
		const parts = inputString.split(',').map((val) => {
			return val.trim();
		});
		this.torqueCollar = parts[0];
		if (!torque[this.torqueCollar]) {
			throw new Error(`PGT setting ${this.torqueCollar} not a valid torque setting`);
		}
		this.speedCollar = parts[1];
		if (!speed[this.speedCollar]) {
			throw new Error(`PGT setting ${this.speedCollar} not a valid speed setting`);
		}
		if (parts[2]) {
			var mtlMatch = /^\d{1,2}\.\d{1}$/;
			if (mtlMatch.test(parts[2])) {
				if (mtl.indexOf(parts[2]) === -1) {
					throw new Error(`PGT setting ${parts[2]} does not appear to be a valid MTL setting`);
				}
				this.mtlCollar = parts[2];
			} else {
				this.socket = parts[2];
			}
		}
		if (parts[3]) {
			if (this.socket) {
				throw new Error(`this.socket already set to ${this.socket}`);
			}
			this.socket = parts[3];
		}
		this.mtlDefault = '30.5';
	}

	getCollars() {
		const collars = [this.torqueCollar, this.speedCollar];
		if (this.mtlCollar) {
			collars.push(this.mtlCollar);
		}
		return collars;
	}

	getCollarValues(includeUnits = false) {
		const values = [
			torque[this.torqueCollar],
			speed[this.speedCollar],
			'MTL ' + (this.mtlCollar || this.mtlDefault)
		];
		if (includeUnits) {
			values[0] += ' ft-lb';
			values[1] += ' RPM';
		}
		return values;
	}

	getSetString() {
		return `PGT [${this.getCollars().join(', ')}]`;
	}

	getValueString() {
		return `(${this.getCollarValues(true).join(', ')})`;
	}

	alterStepBase() {
		return `${this.getSetString()} ${this.getValueString()}`;
	}

	alterStepDocx() {
		const textRuns = [];
		if (this.step.text) {
			textRuns.push(...this.transform(this.step.text));
		}

		const setPGT = new docx.TextRun({
			text: this.getSetString(),
			bold: true
		});

		if (textRuns.length > 0) {
			// if there is step text, put first PGT text on a new line
			setPGT.break();
		}
		textRuns.push(setPGT);

		let valuesText = this.getValueString();
		if (this.socket) {
			valuesText += ` - ${this.socket}`;
		}
		textRuns.push(
			new docx.TextRun({
				text: valuesText
			}).break()
		);

		this.step.text = textRuns;

		return this.step;
	}

};
