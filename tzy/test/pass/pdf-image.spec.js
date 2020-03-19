import fs from 'fs';
import path from 'path';
import pdfimage from 'pdf-image';
var PDFImage = pdfimage.PDFImage;
import chai from 'chai';
const expect = chai.expect;


//constant
const __dirname = path.resolve();
const PDF = path.join(__dirname, 'tmp/STS-134_EVA_1.pdf')
//console.log(PDF)


/*
apt-get install graphicsmagick
provide an option to the PDFImage:  graphicsMagick: true,
*/
 
describe("PDFImage", function () {
  var pdfImage;
  let generatedFiles = [];
  this.timeout(30000);


  beforeEach(function() {
    pdfImage = new PDFImage(PDF, {
          graphicsMagick: true,
        });
     //console.log(pdfImage);
  });


it("should convert all PDF's pages to files", function () {
  //return new Promise(function(resolve, reject) {
    pdfImage.convertFile().then(function (imagePaths) {
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