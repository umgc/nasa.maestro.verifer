/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable max-len */
import Rembrandt from 'rembrandt';
import path from 'path';
import _ from 'lodash';
import unoconv from 'unoconv-promise';

import uuid from 'uuidv4';

export default class CheckerService {
	constructor() {
    	this.imageA = path.resolve() + '/img1.jpg';
    	this.imageB = path.resolve() + '/img2.jpg';
		console.log(this.imageA);
	}

	async checkDifference(files, threshold = 0, delta = 0, offset = 0, render = false) {
		try {
			const session = uuid.uuid();
			const uploads = this.saveUploadedFiles(session, files);

			// Should throw an exception if not enough files
			if (uploads.lenght < 2) {
				throw new Error('Not enough files uploaded');
			}

			// Possibly move exceptions in private functions
			// const data = this.convertDocxToImg(session, uploads);

			console.log('Gets here 1');
			// this.processImages(session, data);
			const rembrandt = new Rembrandt({
				// `imageA` and `imageB` can be either Strings (file path on node.js, public url on Browsers) or Buffers
				imageA: this.imageA, imageB: this.imageB,
				// imageB: fs.readFileSync('/path/to/imageB'),
				thresholdType: Rembrandt.THRESHOLD_PERCENT, // either THRESHOLD_PERCENT or THRESHOLD_PIXELS
				maxThreshold: threshold, //  (0...1 for THRESHOLD_PERCENT, pixel count for THRESHOLD_PIXELS
				maxDelta: delta, // Maximum color delta (0...1):
				maxOffset: offset, // Maximum surrounding pixel offset
				renderComposition: render, // Should Rembrandt render a composition image?
				compositionMaskColor: Rembrandt.Color.RED // Color of unmatched pixels
			});

			console.log('Gets here 2');
			const retVal = await rembrandt.compare()
				.then((result) => {
					console.log('Passed:', result.passed);
					console.log('Pixel Difference:', result.differences, 'Percentage Difference', result.percentageDifference, '%');
					console.log('Composition image buffer:', result.compositionImage);
					return result;
				})
				.catch((e) => console.error(e));
			console.log(retVal);
			return retVal;
		} catch (err) {
			console.log(err);
		}
	}

	async saveUploadedFiles(session, files) {
		const uploads = [];
		// loop all files
		_.forEach(_.keysIn(files.docs), (key) => {
			const docx = files.docs[key];
			uploads.push({
				name: docx.name,
				mimetype: docx.mimetype,
				size: docx.size
			});
			// move photo to uploads directory
			docx.mv(`./uploads/${session}/${docx.name}`);
			// this.convertDocxToPdf(session, docx);
		});
		this.convertDocxToPdf(session, uploads[0]);

		console.log('[DEBUG] -- ', uploads);
		return uploads;
	}

	convertDocxToPdf(session, docx) {
		console.log('convertDocxToPdf gets here', docx.name);
		// unoconv.convert(`./uploads/${session}/${docx.name}`, 'pdf')

		unoconv.run({
			file: `./uploads/${session}/${docx.name}`,
			output: `./uploads/${session}/${docx.name}.pdf`
		})
			.then((filePath) => {
				console.log('convertPdf to img');
				console.log(filePath);
			})
			.catch((e) => {
				console.log('[DEBUG] Unoconv error --> ', e);
				throw e;
			});

		console.log('convertDocxToPdf gets done here', docx.name);
	}

	convertDocxToImg(session, docs) {
		console.log('convertDocxToImg TO BE IMPLEMENTED STILL!!', docs);
		return session;
	}

	isValidDocxDocument(doc) {
		console.log('isValidDocxDocument TO BE IMPLEMENTED STILL!!', doc);
		return true;
	}

}
