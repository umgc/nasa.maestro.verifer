'use strict';

import chai from 'chai';
import sinon from 'sinon';
import UnoConv from 'unoconv-promise';
import DocXValidatorService from '../src/docXValidator.js';
import Common from '../src/common.js';

describe('API', () => {
	const sandbox = sinon.createSandbox();

	afterEach(() => {
		// completely restore all fakes created through the sandbox
		sandbox.restore();
	});

	describe('DocXValidatorService - Test openFile', () => {
		it('It should report true if the document is converted successfully', async() => {
			// Arrange
			sandbox.stub(UnoConv, 'run').resolves(true);
			const opts = {
				common: null,
				unoconv: UnoConv
			};
			const svc = new DocXValidatorService(opts);

			// Act
			const result = await svc.openFile('filename');

			// Assert
			chai.expect(result).to.be.equal(true);
		});
	});

	describe('DocXValidatorService - Test openFile', () => {
		it('It should report false if the uno services throws an exception', async() => {
			// Arrange
			sandbox.stub(UnoConv, 'run').rejects(new Error('file conversion error'));

			const opts = {
				common: null,
				unoconv: UnoConv
			};
			const svc = new DocXValidatorService(opts);
			// Act
			const result = await svc.openFile('filename');

			// Assert
			chai.expect(result).to.be.equal(false);

		});
	});

	describe('DocXValidatorService - Test Validate', () => {
		it('It should return an error if we pass an empty array', async() => {
			// Arrange
			const common = new Common();
			sandbox.stub(UnoConv, 'run').resolves(true);
			sandbox.stub(common, 'saveUploadedFiles').resolves([]);

			const opts = {
				common: common,
				unoconv: UnoConv
			};
			const svc = new DocXValidatorService(opts);
			// Act
			const result = await svc.validate([]);

			// Assert
			chai.expect(result.message).to.be.equal('Empty file array passed');

		});
	});

	describe('DocXValidatorService - Test Validate', () => {
		it('It should return an error if we pass a null value', async() => {
			// Arrange
			const common = new Common();
			sandbox.stub(UnoConv, 'run').resolves(true);
			sandbox.stub(common, 'saveUploadedFiles').resolves(null);

			const opts = {
				common: common,
				unoconv: UnoConv
			};
			const svc = new DocXValidatorService(opts);
			// Act
			const result = await svc.validate(null);

			// Assert
			chai.expect(result.message).to.be.equal('Empty file array passed');

		});
	});

	describe('DocXValidatorService - Test Validate', () => {
		it('It should return a valid result from an file', async() => {
			// Arrange
			const data = [{ name: 'file1' }];
			const expected = [{ file: 'file1', isValid: true }];

			const common = new Common();
			sandbox.stub(UnoConv, 'run').resolves(true);
			sandbox.stub(common, 'saveUploadedFiles')
				.resolves(data);

			const opts = {
				common: common,
				unoconv: UnoConv
			};
			const svc = new DocXValidatorService(opts);
			// Act
			const result = await svc.validate(data);

			// Assert
			chai.expect(result.lenght).to.be.equal(expected.lenght);
			chai.expect(result).to.eql(expected);
		});
	});

	describe('DocXValidatorService - Test Validate', () => {
		it('It should return an valid result from an array', async() => {
			// Arrange
			const data = [{ name: 'file1' }, { name: 'file2' }];
			const expected = [
				{ file: 'file1', isValid: true },
				{ file: 'file2', isValid: true }
			];

			const common = new Common();
			sandbox.stub(UnoConv, 'run').resolves(true);
			sandbox.stub(common, 'saveUploadedFiles')
				.resolves(data);

			const opts = {
				common: common,
				unoconv: UnoConv
			};
			const svc = new DocXValidatorService(opts);
			// Act
			const result = await svc.validate(data);

			// Assert
			chai.expect(result.lenght).to.be.equal(expected.lenght);
			chai.expect(result).to.eql(expected);

		});
	});

	describe('DocXValidatorService - Test Validate', () => {
		it('It should return an invalid result if the conversion fails', async() => {
			// Arrange
			const data = [{ name: 'file1' }, { name: 'file2' }];
			const expected = [
				{ file: 'file1', isValid: false },
				{ file: 'file2', isValid: false }
			];

			const common = new Common();
			sandbox.stub(UnoConv, 'run').rejects(new Error('Error converting file'));
			sandbox.stub(common, 'saveUploadedFiles')
				.resolves(data);

			const opts = {
				common: common,
				unoconv: UnoConv
			};
			const svc = new DocXValidatorService(opts);
			// Act
			const result = await svc.validate(data);

			// Assert
			chai.expect(result.lenght).to.be.equal(expected.lenght);
			chai.expect(result).to.eql(expected);

		});
	});

	describe('DocXValidatorService - Test Validate', () => {
		it('It should return an error object if an exception occurs', async() => {
			// Arrange
			const msg = 'some fake error';
			const error = new Error(msg);
			const common = new Common();

			sandbox.stub(common, 'saveUploadedFiles')
				.rejects(error);

			const opts = {
				common: common,
				unoconv: UnoConv
			};
			const svc = new DocXValidatorService(opts);
			// Act
			const result = await svc.validate([{ file: 'fileName' }]);
			// Assert
			chai.expect(result.message).to.be.equal(msg);
		});
	});

});
