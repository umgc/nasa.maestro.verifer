import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import unoconv from 'unoconv-promise';
// import 'babel-polyfill';

//
import * as app from '../src/checkerService.js';

// constant
const done = true;
const session = 'sts-134';
const docx = 'STS-134_EVA.docx';
const ndocx = 'sample2.doc';

//
describe('unoconv.convert()', function() {
	// this.timeout(10000);
	let child;

	before(()=>{
		child = unoconv.listen({ verbose: true });
	});

	it('should be rejected if docx doesn\'t exist', ()=> {
		return app.convertDocxToPdf(session, ndocx)
			.then((res) => {
				chai.expect(fs.existsSync(res)).to.be.false;
			})
			.catch((err) => {
				console.log('Should not pass');
			});
	});
	it('should convert docx into PDF and return output path', ()=> {
		// console.log(TEST_FILE_PDF)
		return app.convertDocxToPdf(session, docx)
			.then((outputPath) => {
				// console.log(`#####${outputPath}`);
				// console.log(fs.existsSync(outputPath));
				chai.expect(fs.existsSync(outputPath)).to.be.true;
			})
			.catch((err) =>{
				console.log(err);
			});
	});
	after(function() {
		child = unoconv.listen();
	});
});
