'use strict';
/* eslint-disable max-len */
// import _ from 'lodash';
import Common from './common.js';
import unoconv from 'unoconv-promise';
import uuid from 'uuidv4';
import fs from 'fs';
export default class DocXValidatorService {
	common = new Common();
	constructor() {}

	/**
	 * The function expects a docx file. We try opening it with open office
	 * and if it's a valid docx it will not report an error.
	 * Alternatively we could open the file and parse the content (docx is a zipped up archive)
	 * but is more labor intensive and unless we need to look for specific failure its faster
	 * this way.
	 * N/B. this just makes sure the document is a valid docx. it does not verify the content
	 * formatting
	 * @param {*} files the docxfiles to validate.
	 */
	async validate(files) {
		try {
			const results = [];
			const session = uuid.uuid();
			const uploads = await this.common.saveUploadedFiles(session, files);

			console.log('done saving', uploads);
			for (const docx of uploads) {
				try {
					console.log(`Converting ${docx.name}`);
					await unoconv.run({
						file: `./uploads/${session}/${docx.name}`,
						output: `./uploads/${session}/${docx.name}.pdf`
					});
					results.push({ file: docx.name, isValid: true });
				} catch (err) {
					console.log('[openFile]', err, docx.name);
					results.push({ file: docx.name, isValid: false });
				}
			}
			fs.rmdirSync(`./uploads/${session}`, { recursive: true });
			return results;
		} catch (err) {
			console.log(err);
			return err;
		}
	}

	/**
	 *
	 * @param {*} file
	 */
	async openFile(file) {
		return new Promise((resolve) => {
			unoconv.run({ file: `./uploads/${file}` })
				.then(resolve(true))
				.catch((err) => {
					console.log('[openFile]', err, file);
					resolve(false);
				});
		});
	}
}
