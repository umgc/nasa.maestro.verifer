'use strict';
import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import * as app from '../src/checkerService.js';
const __dirname = path.resolve();

//

describe('test saveUploadedFiles function', function() {
	const session = 'sts-134';
	var files1 = ['STS-134_EVA_1.docx', 'STS-134_EVA_2.docx'];
	var files2 = ['b', 'a.doc'];

	it('copy docx', function() {
		app.saveUploadedFiles('sts-134', files1).then((data) => {
			// console.log(data);
			data.forEach((file) => {
				const f = fs.existsSync(file);
				// eslint-disable-next-line no-unused-expressions
				expect(f).to.be.ok;
			});
		});
	});// it end

	it('docx which donot exists', function() {
		app.saveUploadedFiles('sts-134', files2).then((data) => {
			// console.log(data);
			data.forEach((file) => {
				const f = fs.existsSync(file);
				// eslint-disable-next-line no-unused-expressions
				expect(f).to.be.false;
			});
		});
	});// it end
});
