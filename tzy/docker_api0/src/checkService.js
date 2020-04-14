/* eslint-disable require-jsdoc */
'use strict';
import fs from 'fs';
import path from 'path';
import { resolve } from 'dns';
'use strict';
/* eslint-disable max-len */
// import Rembrandt from 'rembrandt/build/node.js';
// import path from 'path';
import _ from 'lodash';
import unoconv from 'unoconv-promise';
// import uuid from 'uuidv4';
import PDFImage from 'pdf-image';
import gm from 'gm';

const __dirname = path.resolve();
// async
export async function convertDocxToPdf(session, docxName) {
	const docx = path.join(__dirname, './projects', session, docxName);
	// console.log(docx)
	const pdf = this.changeExtension(docx, '.pdf');
	// console.log(pdf)
	return await unoconv.run({
		file: docx,
		output: pdf
	});
}// end func

export async function convertPdfToImg(project, pdfName) {
	console.log(`Attempt to convert ${pdfName}`);
	const pdf = path.join(__dirname, './projects', project, pdfName);
	// console.log(docx)
	const png = this.changeExtension(pdf, '.png');
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

// syncronous function

export function changeExtension(inFile, extName) {
	var fileParse = path.parse(inFile);
	const newName = fileParse.name + extName;
	const newFile = path.join(fileParse.dir, newName);
	// console.log(fileParse);
	return newFile;
}

export function judgeDir(dirPath) {
	fs.stat(dirPath, (err, stats)=>{
		console.log(stats);
		if (err) {
			return false;
		}
		if (stats.isDirectory()) {
			return true;
		} else {
			return false;
		}
	});// end fs.stat
}// end func

export function getFiles(inPath) {
	const files = [];
	const content = fs.readdirSync(inPath);
	// console.log(`files and dirs: ${content}`)
	content.forEach((item) =>{
		const filePath = path.join(inPath, item);
		if (fs.statSync(filePath).isFile()) {
			// console.log(`dir: ${item}`)
			files.push(item);
		}
	});
	return files;
}// end func

export function getFilesByExt(inPath, fileExt) {
	const files = [];
	const content = fs.readdirSync(inPath);
	// console.log(`files and dirs: ${content}`)
	content.forEach((item) =>{
		const filePath = path.join(inPath, item);
		if (fs.statSync(filePath).isFile()) {
			// console.log(`dir: ${item}`)
			// console.log(`dir: ${path.extname(filePath)}`)
			if (path.extname(filePath) === fileExt) {
				files.push(item);
			}
		}
	});
	return files;
}// end func

export function getDirs(inPath) {
	const dir = [];
	const content = fs.readdirSync(inPath);
	// console.log(`files and dirs: ${content}`)
	content.forEach((item) =>{
		const dirPath = path.join(inPath, item);
		if (fs.statSync(dirPath).isDirectory()) {
			// console.log(`dir: ${item}`)
			dir.push(item);
		}
	});
	return dir;
}// end func

export function getProjectFiles(fileExt) {
	// const data = { 'a':['a.doc', 'b.doc'],
	//       'b':['12234.doc', '3444444.doc'],
	//       'c3':['4.doc', '04.doc']
	//  }
	const data = {};
	const projectPath = path.join(__dirname, './projects');
	const projects = getDirs(projectPath);
	// console.log(`projects: ${projects}`)
	projects.forEach((item) =>{
		const inPath = path.join(projectPath, item);
		// console.log(`dir: ${inPath}`)
		const files = getFilesByExt(inPath, fileExt);
		// console.log(`dir: ${files}`)
		data[item] = files;
	});
	// console.log(data)
	return data;
}// end func
