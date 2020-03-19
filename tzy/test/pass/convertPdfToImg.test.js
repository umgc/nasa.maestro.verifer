import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import CheckerService from '../src/checkerService.js';
var app = new CheckerService();

//constant
const __dirname = path.resolve();
const DOCX = path.join(__dirname, 'STS-134_EVA_1.docx');
const PDF = path.join(__dirname, 'STS-134_EVA_1.pdf');

//
app.convertPdfToImg(PDF);
