'use strict';
import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import CheckerService from '../src/checkerService.js';
var app = new CheckerService();
const __dirname = path.resolve();



//
describe('convert docx files into pdf and png', function(){
    this.timeout(9000);
    var result;
    //
      var docx_files = new Array();
      docx_files[0]=path.join(__dirname, '/test/STS-134_EVA_1.docx');
      docx_files[1]=path.join(__dirname, '/test/STS-134_EVA_2.docx');
      var pdf_files = new Array();
      pdf_files[0]=path.join(__dirname, '/test/STS-134_EVA_1.pdf');
      pdf_files[1]=path.join(__dirname, '/test/STS-134_EVA_2.pdf');  
      var png_files = new Array();
      png_files[0]=path.join(__dirname, '/test/STS-134_EVA_1.png');
      png_files[1]=path.join(__dirname, '/test/STS-134_EVA_2.png');  
      
      //
      before(async function(){
        var promise = new Promise( resolve => {
            app.convertFiles(docx_files, resolve);
        });
        result = await promise;
      });
      
      //
      it('should convert docx to pdf', async function(){
            pdf_files.forEach( (file)=>{
              //console.log(fs.existsSync(file));        
              expect(fs.existsSync(file)).to.be.ok;
            });        
      });//end it
      
      //
      it('should convert pdf to png', async function(){
            png_files.forEach( (file)=>{
              //sconsole.log(fs.existsSync(file));        
              expect(fs.existsSync(file)).to.be.ok;
            });        
      });//end it
  });
