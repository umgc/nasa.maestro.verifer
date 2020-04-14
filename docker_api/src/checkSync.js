'use strict';
import fs from 'fs';
import path from 'path';
import { resolve } from 'dns';

// all syncronous function used for node.js

// change extension of a file
export function changeExtension(inFile, extName) {
	var fileParse = path.parse(inFile);
	if (extName.search(/^\./)) {
		extName = '.' + extName;
	}
	const newName = fileParse.name + extName;
	const newFile = path.join(fileParse.dir, newName);
	// console.log(fileParse);
	return newFile;
}

// judge is Directory
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

// get files in a given directory
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

// get files by extension
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

// get directory
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

// get project files
// eslint-disable-next-line require-jsdoc
export function getProjectFiles(fileExt) {
	// const data = { 'a':['a.doc', 'b.doc'],
	//       'b':['12234.doc', '3444444.doc'],
	//       'c3':['4.doc', '04.doc']
	//  }
	const data = {};
	const projectPath = path.join(__dirname, '../projects');
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
