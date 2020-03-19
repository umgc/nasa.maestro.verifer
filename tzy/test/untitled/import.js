'use strict';

import chai from 'chai';
import unoconv from 'unoconv-promise';
import CheckerService from '../src/checkerService.js'; // Our app

var app = new CheckerService();
var docx = new Object();
docx.name='STS-134_EVA_1.docx';


		
app.convertDocxToPdf('sts-134', docx);
