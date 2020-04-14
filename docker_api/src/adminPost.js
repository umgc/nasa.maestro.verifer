/* eslint-disable require-jsdoc */
import express from 'express';
const app = express();
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import checkDir from './checkDir.js';
const dirApp = new checkDir();
import checkFile from './checkFile.js';
const fileApp = new checkFile();
import * as serviceApp from './checkerService.js';

const __dirname = path.resolve();
// middleware for form handling
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({ extended: false }));

export default (str) => str.uoUperCase();

// create a project folder
export function doCreateProject(req, res) {
	console.log(__dirname);

	const projects = req.app.get('projects');
	console.log(projects);
	if (req.body.projectName) {
		if (projects.includes(req.body.projectName)) {
			res.send('The entering is duplicated');
		} else {
			const projectDir = path.join(__dirname, 'projects', req.body.projectName);
			console.log(projectDir);
			dirApp.createDir(projectDir).then((res) =>{
				console.log(`The project ${req.body.projectName} is created`);
			});
			projects.push(req.body.projectName);
			res.redirect('/createProject');
		}
	} else {
		res.send('enter project name at least one character');
	}

}

// upload a docx file
export function doDocxUpload(req, res) {
	// parse a file upload
	const form = formidable({
		multiples: true,
		uploadDir: path.join(__dirname, './uploads'),
		keepExtensions: true
	});
	form.parse(req, (err, fields, files) => {
		if (err) {
			next(err);
			return;
		}
		// res.json({ fields, files })
		// vaidate file extension
		// console.log(files)
		if (path.extname(files.docxFile.name) == '.docx') {
			// console.log(fields.project)//project name
			const projectFile = path.join(__dirname, './projects', fields.project, files.docxFile.name);
			console.log(projectFile);
			fileApp.copyFile(files.docxFile.path, projectFile).then((res) =>{
				console.log(`Upload a docx file ${files.docxFile.path}`);
			});
			res.redirect('/nasa-enter');
		} else {
			// console.log(files.docxFile.path)
			fs.unlink(files.docxFile.path, (err)=>{
				console.log('the uploaded file is deleted');
			});
			res.send('A docx file should be selected. Or the extesnion should be .docx. No uploaded');
		}
	});
}

export function doConvertDocx(req, res) {
	// console.log('convert docx')
	const project = req.body.select1;
	const docxName = req.body.select2;
	//
	serviceApp.convertDocxToPdf(project, docxName)
		.then((outputPath) => {
			console.log(outputPath);
			// fs.unlinkSync(outputPath)
		});
}// end func

export function doConvertPdf(req, res) {
	// console.log('convert pdf')
	const project = req.body.select1;
	const pdfName = req.body.select2;
	//
	serviceApp.convertPdfToImg(project, pdfName)
		.then((outputPath) => {
			console.log(outputPath);
			// fs.unlinkSync(outputPath)
		});
}

export function compareImg(req, res) {
	// console.log('compare images')
	const session = req.body.select1;
	const img1 = req.body.select2;
	const img2 = req.body.select3;
	// console.log(`${session}: ${img1} vs. ${img2}`);
	const tolerance = req.body.gmTolerance;
	const color = req.body.gmColor;
	//
	const imgs = [img1, img2];
	const options = {
		tolerance: Number(tolerance) / 100,
		highlightColor: color
	};
	// console.log(options);
	serviceApp.performGMAnalysis(session, imgs, options)
		.then((res)=>{
			console.log(res);
		});
}
