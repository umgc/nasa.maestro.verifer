'use strict';
import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import * as app from '../src/checkerService.js';
const __dirname = path.resolve();

//
describe('convert docx files into pdf and png', function() {
	var result;
	//
	const session = 'sts-134';
	var files = ['STS-134_EVA_1.docx', 'STS-134_EVA_2.docx'];
	//
	var docx_files = new Array();
	docx_files[0] = path.join(__dirname, 'projects', session, 'STS-134_EVA_1.docx');
	docx_files[1] = path.join(__dirname, 'projects', session, 'STS-134_EVA_2.docx');
	var pdf_files = new Array();
	pdf_files[0] = path.join(__dirname, 'projects', session, 'STS-134_EVA_1.pdf');
	pdf_files[1] = path.join(__dirname, 'projects', session, 'STS-134_EVA_2.pdf');
	var png_files = new Array();
	png_files[0] = path.join(__dirname, 'projects', session, 'STS-134_EVA_1.png');
	png_files[1] = path.join(__dirname, 'projects', session, 'STS-134_EVA_2.png');

	//
	before(async() =>{
		await app.convertFiles(session, files);
	});

	// test pdf
	it('should convert docx to pdf', function() {
		pdf_files.forEach((file)=>{
			// console.log(file);
			// console.log(fs.existsSync(file));
			expect(fs.existsSync(file)).to.be.ok;
		});

	});// end it

	// test img
	it('should convert pdf to png', function() {
		png_files.forEach((file)=>{
			// console.log(fs.existsSync(file));
			expect(fs.existsSync(file)).to.be.ok;
		});
	});// end it
});
