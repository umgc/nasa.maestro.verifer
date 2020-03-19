'use strict';
import path from 'path';
import chai from 'chai';
import unoconv from 'unoconv-promise';
import CheckerService from '../src/checkerService.js'; // Our app
var app = new CheckerService();

//
const __dirname = path.resolve();
const DOCX = path.join(__dirname, 'STS-134_EVA_1.docx')
const PDF = path.join(__dirname, 'STS-134_EVA_1.pdf')
app.convertDocxToPdf(DOCX, PDF)
      .then((outputPath) => {
        console.log(outputPath)
        //fs.unlinkSync(outputPath)
      })
      .catch((e) => {
        done(e)
      });







