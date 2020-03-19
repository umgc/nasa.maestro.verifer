import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import unoconv from 'unoconv-promise';

//constant
const __dirname = path.resolve();
const DOCX = path.join(__dirname, 'STS-134_EVA_1.docx')
const PDF = path.join(__dirname, 'STS-134_EVA_1.pdf')
//console.log(TEST_DOCX)
//string doesn't work. Err: type dection failed
const x='/home/yuan/project/nasa.maestro.verifer/tzy/testSTS-134_EVA_1.docx';
unoconv
  .run({
    file: DOCX,
    output: PDF,
    export: "PageRange=1-1"
  })
  .then(filePath => {
    console.log(filePath);
  })
  .catch(e => {
    done(e);
  });
