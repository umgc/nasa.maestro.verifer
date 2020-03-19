'use strict';
import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import CheckerService from '../src/checkerService.js';
var app = new CheckerService();
const __dirname = path.resolve();

const DOCX = path.join(__dirname, 'STS-134_EVA_1.docx');
const session = 'sts-134';
//console.log(path.parse(DOCX));
const out =  path.join(path.parse(DOCX).dir, 'uploads', session, path.parse(DOCX).base); 

//


describe('test saveUploadedFiles function', function(){
  var files = new Array();
  files[0]=path.join(__dirname, 'test/STS-134_EVA_1.docx');
  files[1]=path.join(__dirname, 'test/STS-134_EVA_2.docx');

  it('copy docx', function(){
    
    app.saveUploadedFiles('sts-134', files).then( data => {
      console.log(data);
      data.forEach( file => {
        expect(fs.existsSync(file)).to.be.ok;
      })
    });
  });//it end

});

