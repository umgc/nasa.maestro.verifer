'use strict';

import chai from 'chai';

import app from '../src/server.js'; // Our app

describe('index test', () => {
	describe('sayHello too function', () => {
		it('should say Hello too guys!', () => {

			const str = 'Hello too guys!';
			chai.expect(str).to.equal('Hello too guys!');
			console.log(app.name);
		});
	});
});
