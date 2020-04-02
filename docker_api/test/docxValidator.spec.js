/* eslint-disable no-unused-expressions */
'use strict';

import chai from 'chai';
import app from '../src/server.js'; // Our app
import DocXValidatorService from '../src/docXValidator.js';

describe('index test', () => {
	describe('sayHello too function', () => {
		it('should say Hello too guys!', () => {

			const str = 'Hello too guys!';
			chai.expect(str).to.equal('Hello too guyz!');
		});
	});
});

describe('index test2 ', () => {
	describe('It should report that the document is Valid', () => {
		it('It should report that the document is Valid', () => {
			// Arrange
			const svc = new DocXValidatorService();
			const session = null;
			const doc = null;
			// Act
			const result = svc.validate(session, doc);
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
			const svc = new DocXValidatorService();
			const doc = null;
			// Act
			const result = svc.validate(doc);
			// Assert
			chai.expect(result).to.be.false;
		});
	});
});
