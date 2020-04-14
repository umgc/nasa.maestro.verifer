import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import * as app from '../src/checkerService.js';

// constant
const session = 'sts-134';
const __dirname = path.resolve();
const PDF = 'STS-134_EVA.pdf';
const png = path.join(__dirname, 'projects', session, 'STS-134_EVA.pdf');
console.log(png);

describe('convertPdfToImg', function() {
	const generatedFiles = [];
	this.timeout(30000);

	it("should convert all PDF's pages to files", function() {
		// return new Promise(function(resolve, reject) {
		app.convertPdfToImg(session, PDF).then(function(imagePaths) {
			imagePaths.forEach(function(imagePath) {
				expect(fs.existsSync(imagePath)).to.be.true;
				generatedFiles.push(imagePath);
			});
			resolve();
		}).catch(function(err) {
			reject(err);
		});
		// });
	});

});
