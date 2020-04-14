'use strict';
import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import CheckFile from '../src/checkFile.js';
var app = new CheckFile();
const __dirname = path.resolve();

const DOCX = path.join(__dirname, 'projects/sts-134/STS-134_EVA_1.docx');
const out = path.join(__dirname, 'projects/sts-65/STS-134_EVA_1.docx');
// console.log(path.parse(DOCX));
const nDOCX = path.join(__dirname, '/test/STS-134_EVA_wrong.docx');

describe('test copying of file', function() {

	it('should copy docx', function() {
		app.copyFile(DOCX, out)
			.then((result) => {
				// console.log(result);
				expect(result).to.be.ok;
			});
	});//

	it('should not copy docx', function() {
		app.copyFile(nDOCX, out)
			.then((result) => {
				// console.log(result);
				expect(result).to.be.false;
			});
	});//
});
