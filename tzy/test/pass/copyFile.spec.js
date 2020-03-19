'use strict';
import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import CheckerService from '../src/checkerService.js';
var app = new CheckerService();
const __dirname = path.resolve();

const DOCX = path.join(__dirname, '/test/STS-134_EVA_1.docx');
const n_DOCX = path.join(__dirname, '/test/STS-134_EVA_wrong.docx');const session = 'sts-134';
//console.log(path.parse(DOCX));
const out =  path.join(path.parse(DOCX).dir, 'uploads', session, path.parse(DOCX).base); 
const n_out =  path.join(path.parse(n_DOCX).dir, 'uploads', session, path.parse(n_DOCX).base); 




describe('test copying of file', function(){
  
  it('should copy docx', function(){
      app.copyFile(DOCX, out)
        .then( (result) => {
          console.log(result);
          expect(fs.existsSync(result)).to.be.ok;
        });
  });//
  

});

