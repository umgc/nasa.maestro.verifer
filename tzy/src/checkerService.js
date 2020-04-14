'use strict';
/* eslint-disable max-len */
// import Rembrandt from 'rembrandt/build/node.js';
// import path from 'path';
import _ from 'lodash';
import unoconv from 'unoconv-promise';
import uuid from 'uuidv4';
import PDFImage from 'pdf-image';
import gm from 'gm';
import path from 'path';
import fs from 'fs';

export default class CheckerService {
	imageMagick = gm.subClass({ imageMagick: true });

	constructor() { 
	  //const dir_uploads = path.join(path.resolve(), 'uploads');
	}

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

			return await this.performGMAnalisys(session, pdfs, threshold, color, render);

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
	async saveUploadedFiles_old(session, files) {
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
  
  //tzy: upload files to upload directory
  async saveUploadedFiles(session, files) {
	const outfiles = new Array();
	files.forEach(file => {
      //console.log(file);
      const out = path.join(path.resolve(), 'test/uploads', session, path.parse(file).base);
      //console.log(out);
	  const target = this.copyFile(file, out);        
	  target.then( res => {
		  outfiles.push(res)
		});
	})
    return Promise.resolve(outfiles);
  }//func end
  
  //tzy: copy file
  async copyFile(sourceFile, targetFile) {
    var rd = fs.createReadStream(sourceFile);
    var wr = fs.createWriteStream(targetFile);
    try {
      return new Promise( (resolve, reject) => {
        rd.on('read error', reject);
        wr.on('write error', reject);
        wr.on('write finished', resolve);
		rd.pipe(wr);
		//console.log('###', targetFile);
        resolve(targetFile);
      });
    } catch (error) {
      rd.destroy();
      wr.end();
      throw error;
    }
  }//

  changeExtension(inFile, extName){
    var fileParse = path.parse(inFile);
    const newName = fileParse.name + extName;
    const newFile = path.join(fileParse.dir, newName);
    //console.log(fileParse);
    return newFile;
  };
  
	/**
	 * convertFiles
	 * @param {uuid} session The current session
	 * @param {any} files The files from the request upload
	 * @return {[any]} an array of doc metadata
	 */
	async convertFiles_old(session, files) {
		// loop through all files
		for (const f of files) {
			const docx = f;
			await this.convertDocxToPdf(session, docx);
			await this.convertPdfToImg(session, docx);
			console.log(`${docx.name} converted to pdf and png!`);
		}
	}

	async convertFiles(files, resolve) {
		// loop through all files
		for (const DOCX of files) {
			const  PDF = this.changeExtension(DOCX, '.pdf');
			await this.convertDocxToPdf(DOCX, PDF);
			await this.convertPdfToImg(PDF);
			console.log(`${DOCX} converted to pdf and png!`);
		}
		return resolve(1);
	};

	/**
	 * convertDocxToPdf
	 * @param {uuid} session The current session
	 * @param {Object} docx The document metadata to convert
	 * @return {Promise<any>} a promise
	 */
	async convertDocxToPdf_old(session, docx) {
		return await unoconv.run({
			file: `./uploads/${session}/${docx.name}`,
			output: `./uploads/${session}/${docx.name}.pdf`
		});
	}

	async convertDocxToPdf(docx, pdf) {
	  //console.log(docx)
		return await unoconv.run({
			file: docx,
			output: pdf
		});
	};
	
	/**
	 * convertPdfToImg.
	 * @param {uuid} session The current session
	 * @param {Object} doc The document metadata to convert
	 * @return {Promise<any>} a promise
	 */
	async convertPdfToImg_old(session, doc) {
		console.log(`Attempting conversion of: ./uploads/${session}/${doc.name}.pdf`);
		const converter = new PDFImage.PDFImage(`./uploads/${session}/${doc.name}.pdf`, { combinedImage: true });
		return converter.convertFile()
			.then(
				(img) => { console.log('Converted: ', img); },
				(err) => { console.log(err); }
			);
	}

  //tzy
	async convertPdfToImg(PDF) {
		console.log(`Attempt to convert ${PDF}`);
		const converter = new PDFImage.PDFImage(PDF, { 
		  combinedImage: true,
		  graphicsMagick: true,
		  });
		return converter.convertFile()
			.then(
				(img) => { console.log('Converted: ', img); },
				(err) => { console.log(err); }
			);
	};


	async performGMAnalisys(session, files, threshold = 0.01, color = 'red', render = false) {
		console.log('analisys', threshold, color, render);
		const options = {
			file: `./uploads/${session}/diff.png`,
			highlightColor: 'red',
			tolerance: Number(threshold),
			highlightStyle: 'assign',
			metric: 'mae'
		};

		// convert -density 300 -colorspace sRGB -alpha off STS-134_EVA_2.sodf.docx.pdf -quality 100 -resize 25% -append out2.png

		return new Promise((resolve, reject) => {
			gm.compare(
				`./uploads/${session}/${files[1].name}.png`,
				`./uploads/${session}/${files[0].name}.png`,
				options,
				async(err, isEqual, equality, raw) => {
					if (err) {
						return reject(err);
					}
					const retVal = await this.analisysComplete(err, isEqual, equality, raw);
					console.log('retVal =', retVal);
					resolve(retVal);
				}
			);
		});
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