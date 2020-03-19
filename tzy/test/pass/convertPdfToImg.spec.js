import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import CheckerService from '../src/checkerService.js';
var app = new CheckerService();


//constant
const __dirname = path.resolve();
const PDF = path.join(__dirname, 'tmp/STS-134_EVA_1.pdf')
//console.log(PDF)


describe("convertPdfToImg", function () {
  let generatedFiles = [];
  this.timeout(30000);



it("should convert all PDF's pages to files", function () {
  //return new Promise(function(resolve, reject) {
    app.convertPdfToImg(PDF).then(function (imagePaths) {
      imagePaths.forEach(function(imagePath){
        expect(fs.existsSync(imagePath)).to.be.true;
        generatedFiles.push(imagePath);
      });
      resolve();
    }).catch(function(err){
      reject(err);
    });
  //});
});



});