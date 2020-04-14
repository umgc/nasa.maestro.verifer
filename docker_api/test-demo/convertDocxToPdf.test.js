import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import unoconv from 'unoconv-promise';

//
import * as app from '../src/checkerService.js';
import { errorMonitor } from 'events';

// constant
const done = true;
const session = 'sts-134';
const docx = 'STS-134_EVA.docx';
const ndocx = 'sample2.doc';

// execution: node -r esm test-demo/convertDocxToPdf.test.js

// exists
app.convertDocxToPdf(session, docx)
	.then((outputPath) => {
		console.log(`#####${outputPath}`);
		// fs.unlinkSync(outputPath)
	})
	.catch((err) =>{
		console.log(err);
	});

//
// app.convertDocxToPdf(session, ndocx)
// 	.then((outputPath) => {
// 		console.log(`#####${outputPath}`);
// 		// fs.unlinkSync(outputPath)
// 	})
// 	.catch((err) =>{
// 		console.log(err);
// 	});
