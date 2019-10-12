/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const expect = require('chai').expect;
const docx = require('docx');
const DocxProcedureWriter = require('../app/writer/procedure/DocxProcedureWriter');
const Procedure = require('../app/model/procedure');

describe('DocxProcedureWriter', function() {
	describe('#constructor', () => {
		it('should create a valid docx.Document object', () => {
			const procWriter = new DocxProcedureWriter(new Procedure(), {});
			expect(procWriter.doc).to.be.instanceOf(docx.Document);
		});
	});
});
