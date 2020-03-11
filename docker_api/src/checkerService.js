'use strict';

/* eslint-disable max-len */
import Rembrandt from 'rembrandt/build/node.js';
import path from 'path';
import _ from 'lodash';
import unoconv from 'unoconv-promise';
import uuid from 'uuidv4';
import PDFImage from 'pdf-image';

export default class CheckerService {
	constructor() {
		this.imageA = path.resolve() + '/uploads/img1.jpg';
		this.imageB = path.resolve() + '/uploads/img2.jpg';
		console.log(this.imageA);
	}

	/**
	 * checkDifference
	 * @param {any} files The files from the request upload
	 * @param {number} threshold defaults to 0
	 * @param {number} delta defaults to 0
	 * @param {number} offset defaults to 0
	 * @param {boolean} render defaults to false
	 * @return {[any]} an JSON object with the operation results
	 */
	async checkDifference(files, threshold = 0, delta = 0, offset = 0, render = false) {
		try {
			const session = uuid.uuid();

			const pdfs = await this.saveUploadedFiles(session, files);

			await this.convertFiles(session, pdfs);

			return await this.performAnalisys(session, pdfs, threshold, delta, offset, render);

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
		return converter.convertFile();
	}

	async performAnalisys(session, files, threshold = 0.01, delta = 0.02, offset = 0, render = false) {
		console.log('analisys', threshold, delta, offset, render);

		// this.processImages(session, data);
		const rembrandt = new Rembrandt({
			// `imageA` and `imageB` can be either Strings (file path on node.js, public url on Browsers) or Buffers
			imageA: `./uploads/${session}/${files[0].name}.png`,
			imageB: `./uploads/${session}/${files[1].name}.png`,
			// imageB: fs.readFileSync('/path/to/imageB'),
			thresholdType: Rembrandt.THRESHOLD_PERCENT, // either THRESHOLD_PERCENT or THRESHOLD_PIXELS
			maxThreshold: threshold, //  (0...1 for THRESHOLD_PERCENT, pixel count for THRESHOLD_PIXELS
			maxDelta: delta, // Maximum color delta (0...1):
			maxOffset: offset, // Maximum surrounding pixel offset
			renderComposition: render, // Should Rembrandt render a composition image?
			compositionMaskColor: Rembrandt.Color.RED // Color of unmatched pixels
		});

		const retVal = await rembrandt.compare()
			.then((result) => {
				console.log('Passed:', result.passed);
				console.log('Pixel Difference:', result.differences, 'Percentage Difference', result.percentageDifference, '%');
				console.log('Composition image buffer:', result.compositionImage);
				this.writeOutputFile(result.compositionImage);
				return result;
			})
			.catch((e) => console.error(e));

		return retVal;
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

	later(delay) {
		return new Promise(function(resolve) {
			setTimeout(resolve, delay);
		});
	}

	writeOutputFile(bytearray) {
		console.log(bytearray);
	}
}
