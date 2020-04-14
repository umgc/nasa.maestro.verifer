import fs from 'fs';
import path from 'path';
import PDFImage from 'pdf-image';
import unoconv from 'unoconv-promise';
// import uuid from 'uuidv4';
import gm from 'gm';
import * as app from '../src/checkerService.js';

// const __dirname =
const session = 'sts-134';
const fileNames = ['STS-134_EVA_1.png', 'STS-134_EVA_2.png'];
// const png1 = path.join(__dirname, '../projects', session, 'STS-134_EVA_1.png');
// const png2 = path.join(__dirname, '../projects', session, 'STS-134_EVA_2.png');
// console.log(png1);

const options = {
	tolerance: 0.02,
	highlightColor: 'red',
	render: false
};
app.performGMAnalysis(session, fileNames, options)
	.then((res)=>{
		console.log(res);
	});
