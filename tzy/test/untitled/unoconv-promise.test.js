'use strict';

import chai from 'chai';
import path from 'path';
import unoconv from 'unoconv-promise';


const __dirname = path.resolve();
const TEST_FILE = path.join(__dirname, '/test/uploads/sts-134/STS-134_EVA_1.docx')
const TEST_FILE_PDF = path.join(__dirname, '/test/uploads/sts-134/STS-134_EVA_1.pdf')

unoconv
  .run({
    file: "./uploads/sts-134/STS-134_EVA_1.docx",
    output: "./uploads/sts-134/STS-134_EVA_1.pdf",
    export: "PageRange=1-1"
  })
  .catch(e => {
     //done(e);
  })
  .then(outputPath => {
    console.log(`====`, outputPath);
  })
;

