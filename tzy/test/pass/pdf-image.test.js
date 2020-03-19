import fs from 'fs';
import path from 'path';
import pdfimage from 'pdf-image';
var PDFImage = pdfimage.PDFImage;

//constant
const __dirname = path.resolve();
const PDF = path.join(__dirname, 'tmp/STS-134_EVA_1.pdf')
//console.log(PDF)


/*
apt-get install graphicsmagick
provide an option to the PDFImage

*/
 
var pdfImage = new PDFImage(PDF,{
  graphicsMagick: true,
});
console.log(pdfImage);
console.log("####Start");
pdfImage.convertFile()
        .then( function(imagePath){
          console.log("#####Converted.");
          imagePath.forEach(function(img){
              console.log(fs.existsSync(img));
              });
        })
        .catch(function(err){
        reject(err);
      });

