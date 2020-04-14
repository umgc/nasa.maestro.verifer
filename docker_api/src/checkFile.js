'use strict';
import fs from 'fs';
import path from 'path';
import { resolve } from 'dns';

// fs.stats return callback function
// use Promise to get resolve and reject with async-await
export default class checkFile {
	constructor() { }

	async fileStatus(inFile) {
		return new Promise((resolve, reject) => {
			if (fs.existsSync(inFile)) {
				fs.stat(inFile, (err, stats) =>{
					if (err) {
						reject(err);
					} else {
						resolve(stats);
					}
				});
			} else {
				console.log(`${inFile} doesnot exist.`);
				resolve(0);
			}
		});
	}// end func

	async renameFile(oldFile, newFile) {
		return new Promise((resolve, reject) => {
			if (fs.existsSync(oldFile)) {
				fs.rename(oldFile, newFile, (err) =>{
					reject(err);
				});
				console.log(`${oldFile} is renamed to ${newFile}`);
				resolve(1);
			} else {
				console.log(`${oldfile} doesnot exist.`);
				resolve(0);
			}
		});
	}// end func

	async deleteFile(infile) {
		return new Promise((resolve, reject) => {
			if (fs.existsSync(infile)) {
				fs.unlink(infile, (err)=>{
					reject(err);
				});
				console.log(`${infile} is deleted.`);
				resolve(1);
			} else {
				console.log(`${infile} doesnot exist.`);
				resolve(0);
			}
		});
	}// end func

	// copy file
	async copyFile(oldFile, newFile) {
		return new Promise((resolve, reject) =>{
			fs.copyFile(oldFile, newFile, (err)=>{
				if (err) {
					resolve(false);
				} else {
					console.log(`${oldFile} is copied as ${newFile}`);
					resolve(true);
				}
			});
		});
	}// end func

	async copyFiles(inFiles, outDir) {
		const suc = [];
		const fail = [];
		inFiles.forEach((oldFile) =>{
			const newFile = path.join(outDir, path.basename(oldFile));
			const s = this.copyFile(oldFile, newFile);
			s.then((res) =>{
				if (res == true) {
					suc.push(newFile);
				} else {
					fail.push(oldFile);
				}
			});
		});
		return Promise.resolve({ success: suc, fail: fail });
	}
}// end class
