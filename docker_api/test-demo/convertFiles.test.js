'use strict';
import path from 'path';
import chai from 'chai';
import * as app from '../src/checkerService.js'; // Our app

// node -r esm test-demo/convertFiles.test.js

//
var files = ['STS-134_EVA_1.docx', 'STS-134_EVA_2.docx'];
app.convertFiles('sts-134', files);
// .then((res)=>{
// 	console.log(res);
// });
