'use strict';
/* eslint-disable max-len */
import _ from 'lodash';

// NB for some reason seems to hang if there are spaces
// or parenthesis in the file names....

export default class Common {
	constructor() { }

	/**
	 * saveUploadedFiles
	 * @param {uuid} session The current session
	 * @param {any} files The files from the request upload
	 * @return {[any]} an array of doc metadata
	 */
	async saveUploadedFiles(session, files) {
		const uploads = [];
		return new Promise((resolve, reject) => {
			try {
				console.log('Saving uploaded files to session folder');
				// loop through all files
				_.forEach(_.keysIn(files), (key) => {
					const docx = files[key];
					uploads.push({
						name: docx.name,
						mimetype: docx.mimetype,
						size: docx.size
					});
					docx.mv(`./uploads/${session}/${docx.name}`);
					console.log(`${docx.name} saved!`);
				});
				resolve(uploads);
			} catch (err) {
				console.log(err);
				reject(err);
			}
		});
	}
}
