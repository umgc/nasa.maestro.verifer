'use strict';
/* eslint-disable max-len */
// import _ from 'lodash';
// import fs from 'fs';

// NB for some reason seems to hang if there are spaces
// or parenthesis in the file names....

export default class DocXValidatorService {
	constructor() { }

	async validate(files) {
		try {
			const results = [];
			for (const docx of files) {
				const value = await this.openFile(docx.name);
				results.push({ file: docx.name, isValid: value });
			}
			return results;
		} catch (err) {
			console.log(err);
			return err;
		}
	}

	async openFile(file) {
		return new Promise((resolve) => {
			try {
				resolve(true);
			} catch (err) {
				console.log('[openFile]', err, file);
				resolve(false);
			}
		});
	}
}
