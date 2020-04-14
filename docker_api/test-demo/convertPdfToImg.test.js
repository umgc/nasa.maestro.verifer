import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import * as app from '../src/checkerService.js';

// execution: node -r esm test-demo/convertPdfToImg.test.js

//
app.convertPdfToImg('sts-134', 'STS-134_EVA.pdf')
	.then((img) =>{
		console.log('Converted image file: ', img);
	})
	.catch((err) =>{
		console.log(err);
	});
