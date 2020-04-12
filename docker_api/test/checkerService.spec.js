/* eslint-disable no-unused-expressions */
'use strict';

import chai from 'chai';
// import app from '../src/server.js'; // Our app
import CheckerService from '../src/checkerService.js';

describe('index test', () => {
	describe('sayHello too function', () => {
		it('should say Hello too guys!', () => {

			const str = 'Hello too guys!';
			chai.expect(str).to.equal('Hello too guys!');
		});
	});
});

describe('index test2 ', () => {
	describe('It should report that the document is Valid', () => {
		it('It should report that the document is Valid', () => {
			// Arrange
			const svc = new CheckerService();
			const session = null;
			const doc = null;
			// Act
			const result = svc.isValidDocxDocument(session, doc);
			console.log(result);
			// Assert
			chai.expect(result).to.be.true;
		});
	});
});

describe('index test2 ', () => {
	describe('It should report that the document is Valid', () => {
		it('It should report that the document is not valid if document is null', () => {
			// Arrange
			const svc = new CheckerService();
			const session = null;
			const doc = null;
			// Act
			const result = svc.isValidDocxDocument(session, doc);
			// Assert
			chai.expect(result).to.be.false;
		});
	});
});
