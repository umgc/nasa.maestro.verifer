'use strict';
/* eslint-disable max-len */
import _ from 'lodash';
import unoconv from 'unoconv-promise';
import uuid from 'uuidv4';
import PDFImage from 'pdf-image';
import gm from 'gm';
import spawn from 'cross-spawn';

// NB for some reason seems to hang if there are spaces
// or parenthesis in the file names....

export default class CheckerService {
	imageMagick = gm.subClass({ imageMagick: true });

	constructor() { }

	/**
	 * checkDifference
	 * @param {any} files The files from the request upload
	 * @param {number} threshold defaults to 0
	 * @param {number} color defaults to 0
	 * @param {boolean} render defaults to false
	 * @return {[any]} an JSON object with the operation results
	 */
	async checkDifference(files, threshold = 0.01, color = 'red', render = false) {
		try {
			const session = uuid.uuid();

			const pdfs = await this.saveUploadedFiles(session, files);

			await this.convertFiles(session, pdfs);

			return await this.performIMAnalisys(session, pdfs, threshold, color, render);

		} catch (err) {
			console.log(err);
		}
	}

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
				// loop through all files
				_.forEach(_.keysIn(files.docs), (key) => {
					const docx = files.docs[key];
					uploads.push({
						name: docx.name,
						mimetype: docx.mimetype,
						size: docx.size
					});
					// move photo to uploads directory
					docx.mv(`./uploads/${session}/${docx.name}`);
					console.log(`${docx.name} saved!`);
				});
				resolve(uploads);
			} catch (err) {
				reject(err);
			}
		});
	}

	/**
	 * convertFiles
	 * @param {uuid} session The current session
	 * @param {any} files The files from the request upload
	 * @return {[any]} an array of doc metadata
	 */
	async convertFiles(session, files) {
		// loop through all files
		for (const f of files) {
			const docx = f;
			await this.convertDocxToPdf(session, docx);
			await this.convertPdfToImg(session, docx);
			console.log(`${docx.name} converted to pdf and png!`);
		}
	}

	/**
	 * convertDocxToPdf
	 * @param {uuid} session The current session
	 * @param {Object} docx The document metadata to convert
	 * @return {Promise<any>} a promise
	 */
	async convertDocxToPdf(session, docx) {
		return await unoconv.run({
			file: `./uploads/${session}/${docx.name}`,
			output: `./uploads/${session}/${docx.name}.pdf`
		});
	}

	/**
	 * convertPdfToImg.
	 * @param {uuid} session The current session
	 * @param {Object} doc The document metadata to convert
	 * @return {Promise<any>} a promise
	 */
	async convertPdfToImg(session, doc) {
		console.log(`Attempting conversion of: ./uploads/${session}/${doc.name}.pdf`);
		const converter = new PDFImage.PDFImage(`./uploads/${session}/${doc.name}.pdf`, { combinedImage: true });
		return converter.convertFile()
			.then(
				(img) => { console.log('Converted: ', img); },
				(err) => { console.log(err); }
			);
	}

	async performIMAnalisys(session, files, threshold = 0.01, color = 'red', render = false) {
		const output = `./uploads/${session}/diff.png`;
		const file0 = `./uploads/${session}/${files[0].name}.png`;
		const file1 = `./uploads/${session}/${files[1].name}.png`;

		const opts = { env: process.env, killSignal: 'SIGKILL', stdio: 'inherit' };

		const args = [
			'-metric', 'AE', '-fuzz', '5%',
			file0, file1, '-compose', 'src',
			output
		];

		try {
			const proc = spawn.sync('compare', args, opts);
			console.log(proc);
		} catch (err) { console.error(err); }
	}

	/**
	 * isValidDocxDocument.
	 * @param {uuid} session The current session
	 * @param {Object} doc The document metadata to validate
	 * @return {boolean} a promise
	 */
	isValidDocxDocument(session, doc) {
		console.log('isValidDocxDocument TO BE IMPLEMENTED STILL!!', doc);
		return true;
	}

	async analisysComplete(err, isEqual, equality, raw) {
		return new Promise(
			(resolve, reject) => {
				if (err) {
					reject(err);
				} else {
					resolve({ isEqual: isEqual, equality: equality, raw: JSON.stringify(raw) });
				}
			}
		);
	}
}
