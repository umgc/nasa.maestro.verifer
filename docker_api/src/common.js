'use strict';
/* eslint-disable max-len */
import _ from 'lodash';

export default class Common {
	constructor() { }

	/**
	 * saveUploadedFiles
	 * Loops throught the uploaded files array,
	 * extraxts basic metadata
	 * and saves them to a temporary directory
	 * @param {uuid} session The current session
	 * @param {any} files The files from the request upload
	 * @return {[any]} an array of doc metadata
	 */
	async saveUploadedFiles(session, files) {
		const savedUploads = [];
		return new Promise((resolve, reject) => {
			try {
				console.log('Saving uploaded files to session folder');
				// loop through all files
				_.forEach(_.keysIn(files), (key) => {
					const docx = files[key];
					savedUploads.push({
						name: docx.name,
						mimetype: docx.mimetype,
						size: docx.size
					});
					docx.mv(`./uploads/${session}/${docx.name}`);
					console.log(`${docx.name} saved!`);
				});
				resolve(savedUploads);
			} catch (err) {
				console.log(err);
				reject(err);
			}
		});
	}
}
