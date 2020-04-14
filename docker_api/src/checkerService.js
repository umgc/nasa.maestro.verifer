/* eslint-disable require-jsdoc */
'use strict';
import fs from 'fs';
import path from 'path';
import { resolve } from 'dns';
'use strict';
/* eslint-disable max-len */
// import Rembrandt from 'rembrandt/build/node.js';
import _ from 'lodash';
import unoconv from 'unoconv-promise';
// import uuid from 'uuidv4';
import PDFImage from 'pdf-image';
import gm from 'gm';
import * as checkSync from './checkSync.js';
import checkFile from './checkFile.js';
import { response } from 'express';
const fileApp = new checkFile();

const __dirname = path.resolve();
// async
export async function convertDocxToPdf(session, docxName) {
	const docx = path.join(__dirname, './projects', session, docxName);
	// console.log(docx)
	const pdf = checkSync.changeExtension(docx, '.pdf');
	// console.log(pdf)
	return await unoconv.run({
		file: docx,
		output: pdf
	});
}// end func

export async function convertPdfToImg(session, pdfName) {
	console.log(`Attempt to convert ${pdfName}`);
	const pdf = path.join(__dirname, './projects', session, pdfName);
	// console.log(docx)
	const png = checkSync.changeExtension(pdf, '.png');
	// console.log(pdf)
	const converter = new PDFImage.PDFImage(pdf, {
		combinedImage: true,
		graphicsMagick: true
	});
	return converter.convertFile()
		.then(
			(img) => { console.log('Converted: ', img); },
			(err) => { console.log(err); }
		);
}// end func

// upload files to upload directory
export async function saveUploadedFiles(session, files) {
	const outFiles = new Array();
	return new Promise((resolve, reject) => {
		for (const fileName of files) {
			const inFile = path.join(path.resolve(), 'uploads', fileName);
			// console.log(infile);
			const outFile = path.join(path.resolve(), 'projects', session, path.parse(fileName).base);
			// console.log(out);
			outFiles.push(outFile);
			fileApp.copyFile(inFile, outFile);
		}
		resolve(outFiles);
	});
	// console.log(outFiles);

}// func end

/**
	 * convertFiles
	 * @param {uuid} session The current session
	 * @param {Array} files The files from the request upload
	 * @return {Promise<any>}
	 */
export async function convertFiles(session, files) {
	const outFiles = [];
	// loop through all files
	const finalResult = files.map(async(docx) =>{
		// const docxPath = path.join(this.outPath, session, docx);
		const pdf = checkSync.changeExtension(docx, '.pdf');
		// outFiles.push(pdf);
		const result1 = await this.convertDocxToPdf(session, docx);
		const result2 = await this.convertPdfToImg(session, pdf);
		console.log(`####${docx} converted to pdf and png!`);
		const result = result1 + result2;
		return result;
	});
	const r = await Promise.all(finalResult);
	// console.log(r);
	return r;
}

export function toPath(session, fileName) {
	return path.join(__dirname, './projects', session, fileName);
}
// compare two images using gm.compare
export async function performGMAnalysis(session, fileNames, inputOptions) {
	const diffName = path.basename(fileNames[0], path.extname(fileNames[0])) +
						'_vs_' + fileNames[1];
	const options = {
		file: this.toPath(session, diffName),
		tolerance: 0.01,
		highlightColor: 'red',
		render: false,
		highlightStyle: 'assign',
		metric: 'mae',
		...inputOptions
	};
	// console.log('analisys images', options);
	const img1 = this.toPath(session, fileNames[0]);
	const img2 = this.toPath(session, fileNames[1]);
	// console.log(img1);
	// console.log(options.file);
	// convert -density 300 -colorspace sRGB -alpha off STS-134_EVA_2.sodf.docx.pdf -quality 100 -resize 25% -append out2.png
	return new Promise((resolve, reject) => {
		gm.compare(img1, img2, options,
			async(err, isEqual, equality, raw) => {
				if (err) {
					resolve({ isEqual: false });
				}
				const retVal = await this.analysisComplete(err, options.file, isEqual, equality, raw);
				// console.log('retVal =', retVal);
				resolve(retVal);
			});
	});
}

export async function analysisComplete(err, diffImg, isEqual, equality, raw) {
	return new Promise(
		(resolve, reject) => {
			if (err) {
				reject(err);
			} else {
				resolve({
					diffImg: diffImg,
					isEqual: isEqual,
					equality: equality,
					raw: JSON.stringify(raw)
				});
			}
		});
}
