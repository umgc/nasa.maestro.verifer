'use strict';

import chai from 'chai';
import checkDir from '../src/checkDir.js'; // Our app

// chai.use(require('chai-http'));

describe('index test', () => {
	describe('sayHello function', () => {
		it('should say Hello guys!', () => {
			const str = 'Hello guys!';
			chai.expect(str).to.equal('Hello guys!');
			console.log(checkDir.name);
		});
	});
});

/*

const app = require('../app/server.js'); // Our app

describe('API endpoint /checker', function() {
	this.timeout(5000); // How long to wait for a response (ms)

	before(function() {

	});

	after(function() {

	});

	// POST - Add new color
	it('should add new color', function() {
		return chai.request(app)
			.post('/colors')
			.send({
				color: 'YELLOW'
			})
			.then(function(res) {
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.an('object');
				expect(res.body.results).to.be.an('array').that.includes(
					'YELLOW');
			});
	});

	// POST - Bad Request
	it('should return Bad Request', function() {
		return request(app)
			.post('/colors')
			.type('form')
			.send({
				color: 'YELLOW'
			})
			.then(function(res) {
				throw new Error('Invalid content type!');
			})
			.catch(function(err) {
				expect(err).to.have.status(400);
			});
	});
});
*/
