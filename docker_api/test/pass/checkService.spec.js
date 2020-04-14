'use strict';

import chai from 'chai';

import * as app from '../src/checkerService.js'; // Our app

describe('index test', () => {
	describe('sayHello too function', () => {
		it('should say Hello checkService!', () => {
			const str = 'Hello checkService!';
			chai.expect(str).to.equal('Hello checkService!');
			console.log(app.name);
		});
	});
});
