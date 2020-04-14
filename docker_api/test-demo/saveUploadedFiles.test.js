'use strict';
import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import * as app from '../src/checkerService.js';
const __dirname = path.resolve();

// const DOCX = path.join(__dirname, 'STS-134_EVA_1.docx');
// console.log(path.parse(DOCX));
// const out = path.join(path.parse(DOCX).dir, 'uploads', session, path.parse(DOCX).base);

//
const session = 'sts-134';
var files = ['STS-134_EVA_1.docx', 'STS-134_EVA_2.docx', 'a'];
app.saveUploadedFiles(session, files)
	.then((outFiles) =>{
		// console.log(outFiles);
		outFiles.forEach((file)=>{
			console.log(fs.existsSync(file));
		});
	});
