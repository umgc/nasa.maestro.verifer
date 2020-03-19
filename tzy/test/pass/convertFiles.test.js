'use strict';
import path from 'path';
import chai from 'chai';
import CheckerService from '../src/checkerService.js'; // Our app
var app = new CheckerService();
const __dirname = path.resolve();

/*
const DOCX = path.join(__dirname, 'STS-134_EVA_1.docx');
console.log(DOCX);
var PDF = path.join(__dirname, path.parse(DOCX).name, '.pdf');
var PDF = app.changeExtension(DOCX, '.pdf');
console.log(PDF); 
*/

//
var files = new Array();
files[0]=path.join(__dirname, 'STS-134_EVA_1.docx');
files[1]=path.join(__dirname, 'STS-134_EVA_2.docx');
app.convertFiles(files);