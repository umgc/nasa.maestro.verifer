'use strict';
/* eslint-disable max-len */
import uuid from 'uuidv4';
import fs from 'fs';

// NB for some reason seems to hang if there are spaces
// or parenthesis in the file names....

export default class CheckerService {
	constructor(opts) {
		this.common = opts.common;
		this.unoconv = opts.unoconv;
		this.spawn = opts.spawn;
		this.pdf2imageService = opts.pdf2imageService;
	}

	/**
	 * processData
	 * @param {any} files The files from the request upload
	 * @param {boolean} analyze specifies if the process ends with the generation
	 * of images or the analisys
	 * @return {[any]} an JSON object with the operation results
	 */
	async processData(files, analyze = false) {
		try {
			const session = uuid.uuid();
			const pdfs = await this.common.saveUploadedFiles(session, files);
			await this.convertFiles(session, pdfs);
			if (analyze) {
				return {
					sessionId: session,
					data: await this.performIMAnalisys(session, pdfs)
				};
			} else {
				return {
					sessionId: session,
					data: await this.generateLinks(session, pdfs)
				};
			}
		} catch (err) {
			console.log(err);
		}
	}

	/**
	 * convertFiles
	 * @param {uuid} session The current session
	 * @param {any} files The files from the request upload
	 * @return {[any]} an array of doc metadata
	 */
	async convertFiles(session, files) {
		// loop through all files
		console.log('converting uploaded files to pdf and then images (png)');
		let i = 0;
		for (const f of files) {
			console.log(`Processing uploaded file # ${i}`);
			const docx = f;
			await this.convertDocxToPdf(session, docx);
			await this.convertPdfToImg(session, docx, i++);
			fs.renameSync(`./uploads/${session}/${docx.name}.png`, `./uploads/${session}/image-${i}.png`);

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
		return await this.unoconv.run({
			file: `./uploads/${session}/${docx.name}`,
			output: `./uploads/${session}/${docx.name}.pdf`
		});
	}

	/**
	 * convertPdfToImg.
	 * @param {uuid} session The current session
	 * @param {Object} doc The document metadata to convert
	 * @param {number} index The document index to rename the image
	 * @return {Promise<any>} a promise
	 */
	async convertPdfToImg(session, doc) {
		console.log(`Attempting conversion of: ./uploads/${session}/${doc.name}.pdf`);
		const opts = { '-quality': '100' };
		const converter = new this.pdf2imageService.PDFImage(
			`./uploads/${session}/${doc.name}.pdf`,
			{ opts, combinedImage: true });
		return converter.convertFile()
			.then(
				(img) => {
					console.log('Converted: ', img);
					return img;
				},
				(err) => { console.log(err); }
			);
	}

	/**
	 * performIMAnalisys.
	 * @param {uuid} session The current session
	 * @param {[]} files The image metadata to convert
	 * @return {Promise<any>} a promise
	 */
	async performIMAnalisys(session) {
		const output = `./uploads/${session}/diff.png`;
		const file0 = `./uploads/${session}/image-1.png`;
		const file1 = `./uploads/${session}/image-2.png`;
		const args = [
			'-metric', 'AE', '-fuzz', '5%',
			file0, file1, '-compose', 'src',
			output
		];

		try {
			const opts = { env: process.env, killSignal: 'SIGKILL', stdio: ['inherit'] };
			const proc = this.spawn.spawnSync('compare', args, opts);
			const retVal = {};

			if (proc.stderr) {
				// we use the stderr as for dissimilar images imagemagik quirkly returns 1
				// and a non zero return code usually indicates an error
				const difference = proc.stderr.toString('utf8', 0, proc.stderr.length);
				const diffImageSize = this.getImageSize(output);
				retVal.status = proc.status;
				retVal.isIdentical = (proc.status === 0);
				retVal.imageASize = this.getImageSize(file0);
				retVal.imageBSize = this.getImageSize(file1);
				retVal.pixelDiff = parseInt(difference);
				retVal.percentDiff = parseFloat(difference / diffImageSize).toFixed(4);
			}
			return retVal;
		} catch (err) { console.error(err); }
	}

	getImageSize(file) {
		const args = ['-format', '%w %h', file];
		const retVal = {
			height: 0, // success
			width: 0
		};
		const NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;
		try {
			const opts = { env: process.env, killSignal: 'SIGKILL', stdio: ['inherit'] };
			const proc = this.spawn.spawnSync('identify', args, opts);

			retVal.status = proc.status;
			if (proc.status === 0 && proc.stdout) {
				const data = proc.stdout.toString('utf8', 0, proc.stdout.length);
				retVal.width = data.match(NUMERIC_REGEXP)[0];
				retVal.height = data.match(NUMERIC_REGEXP)[1];
			}
			return retVal.height * retVal.width;
		} catch (err) { console.error(err); }
	}

	async generateLinks(session, files) {
		// loop through all files
		const linksArray = [];
		let i = 0;
		for (const f of files) {
			const value = {
				docx: f.name,
				link: `<Host:port>/api/docx/getImage?sessionId=${session}&index=${i}`
			};
			i++;
			linksArray.push(value);
		}
		console.log(linksArray);
		return linksArray;
	}
}
