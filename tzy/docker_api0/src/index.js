import express from 'express';
const app = express();
const router = express.Router();
import * as adminPost from './adminPost.js';
import * as serviceApp from './checkerService.js';

// define routes here..
router.get('/', (request, response)=>{
	// response.send("<h2>server3: server.js, app.js, index.js</h2>")
	response.render('index');
});
router.get('/nasa-enter', (request, response)=>{
	response.render('nasa-enter');
});
router.get('/createProject', (request, response)=>{
	response.render('createProject');
});
router.get('/uploadDocx', (request, response)=>{
	response.render('uploadDocx');
});
router.get('/docxToPdf', (request, response)=>{
	response.render('docxToPdf', {
		label1: 'Select a project',
		label2: 'Select a docx file',
		data: serviceApp.getProjectFiles('.docx')
	});
});
router.get('/pdfToPng', (request, response)=>{
	response.render('pdfToPng', {
		label1: 'Select a project',
		label2: 'Select a pdf file',
		data: serviceApp.getProjectFiles('.pdf')
	});
});
router.get('/compareImg', (request, response)=>{
	response.render('compareImg', {
		label1: 'Select a project',
		label2: 'Select a png file',
		label3: 'Select another png file',
		data: serviceApp.getProjectFiles('.png')
	});
});

router.post('/createProject', adminPost.doCreateProject);
router.post('/uploadDocx', adminPost.doDocxUpload);
router.post('/docxToPdf', adminPost.doConvertDocx);
router.post('/pdfToPng', adminPost.doConvertPdf);
router.post('/compareImg', adminPost.compareImg);
// 404 error
// router.get('/404', (request, response)=>{
//     response.status(404).render('404')
// })
export default router;
