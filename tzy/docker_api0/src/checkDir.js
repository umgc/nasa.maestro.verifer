'use strict';
import fs from 'fs';
import path from 'path';
import { resolve } from 'dns';

// fs.stats return callback function
// use Promise to get resolve and reject with async-await
export default class checkDir {
	constructor() { }

	async listDir(inDir) {
		return new Promise((resolve, reject) => {
			fs.readdir(inDir, (err, files) =>{
				if (err) {
					resolve(false);
				} else {
					resolve(files);
				}
			});
		});
	}// end func

	async listDirFiles(inDir) {
		const dirContents = await this.listDir(inDir);
		const files = dirContents.filter((name) =>{
			const filePath = path.join(inDir, name);
			return fs.statSync(filePath).isFile();
		});
		// console.log(files)
		return Promise.resolve(files);
	}// end func

	async listDirDirs(inDir) {
		const dirContents = await this.listDir(inDir);
		const dirs = dirContents.filter((name) =>{
			const filePath = path.join(inDir, name);
			return fs.statSync(filePath).isDirectory();
		});
		// console.log(dirs)
		return Promise.resolve(dirs);
	}// end func

	async createDir(inDir) {
		return new Promise((resolve, reject) =>{
			fs.mkdir(inDir, (err)=>{
				if (err) {
					console.log(`${inDir} exists. No action.`);
					resolve(false);
				} else {
					console.log(`${inDir} is created`);
					resolve(true);
				}
			});
		});// end promise
	}// end func

	async deleteDir(inDir) {
		return new Promise((resolve, reject) =>{
			fs.rmdir(inDir, (err)=>{
				if (err) {
					console.log(`Deletion of ${inDir} failed.`);
					resolve(false);
				} else {
					console.log(`${inDir} is deleted`);
					resolve(true);
				}
			});
		});// end promise
	}// end func

	async renameDir(oldDir, newDir) {
		return new Promise((resolve, reject) => {
			if (fs.statSync(oldDir).isDirectory) {
				fs.rename(oldDir, newDir, (err) =>{
					resolve(false);
				});
				console.log(`${oldDir} is renamed to ${newDir}`);
				resolve(true);
			} else {
				console.log(`${oldDir} doesnot exist.`);
				resolve(0);
			}
		});// end promise
	}// end func

}// end class
