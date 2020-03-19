'use strict';
import path from 'path';
import chai from 'chai';
var expect = chai.expect;
import CheckerService from '../src/checkerService.js'; // Our app
var app = new CheckerService();


//
describe('change extesion of a file', function(){
  const doc_dir = '/home/yuan/project/nasa.maestro.verifer/tzy/STS-134_EVA_1.';
  const DOCX = doc_dir + 'docx';
  const PDF = doc_dir + 'pdf';
  const PNG = doc_dir + 'png';
    
  it('should change .docx to .pdf extension', function(){
    const result = app.changeExtension(DOCX, '.pdf').toString();
    //console.log(result);
    expect(result).to.be.equal(PDF);
  });
  
  it('should change .pdf to .png extension', function(){
    const result = app.changeExtension(PDF, '.png').toString();
    //console.log(expected);
    //console.log(result);
    expect(result).to.be.equal(PNG);
  });
});

