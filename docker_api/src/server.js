#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import stream from 'stream';
import path from 'path';
import Unoconv from 'unoconv-promise';
import Common from './common.js';
import CheckerService from './checkerService.js';
import DocXValidatorService from './docXValidator.js';
import PDFImage from 'pdf-image';
import spawn from 'child_process';
import awilix from 'awilix';

// TODO refactor to implement dependency injection
// https://blog.risingstack.com/dependency-injection-in-node-js/

const root = path.resolve();
const app = express();
const urlencoderParser = bodyParser.json();
const port = process.env.port || 3000;

// initializes the dependency injection container
const container = awilix.createContainer({
	injectionMode: awilix.InjectionMode.PROXY
});

container.register({
	// Here we are telling Awilix how to resolve a
	// userController: by instantiating a class.
	common: awilix.asClass(Common),
	checkService: awilix.asClass(CheckerService),
	docXService: awilix.asClass(DocXValidatorService),
	pdf2imageService: awilix.asValue(PDFImage),
	unoconv: awilix.asValue(Unoconv),
	spawn: awilix.asValue(spawn)
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({ createParentPath: true }));

// Starts the Api service
app.listen(port, () => {
	console.log('Server is started on http://localhost:' + port);
});

/**
 * receives a docx document and verifies it's valid
 * POST
 * req.files.docs can be either single or multiple files
 * returns a status code with a json result object
 */
app.post('/api/docx/validate', urlencoderParser, async(req, res) => {
	const docSvc = container.resolve('docXService');
	try {
		if (!req.files) {
			// TODO Retun appropriate status
			res.status(400).send({ status: false, message: 'No file uploaded' });
		} else {
			const files = (Array.isArray(req.files.docs)) ?
				req.files.docs :
				[req.files.docs];

			docSvc.validate(files)
				.then((result) => { res.send(result); })
				.catch((error) => { res.status(500).send(error); });
		}
	} catch {
		res.status(500).send('internal server error');
	}
});

/**
 * Receives two docx and compares them
 * POST
 * req.files.docs can be either single or multiple files
 * returns a status code with a json result object including
 * a percent difference, and formed links to the images produced
 */
app.post('/api/docx/checkDifference', urlencoderParser, async(req, res) => {
	console.log(req.body, 'Calculating difference between document outputs.');
	if (!req.files) {
		res.status(400).send({ status: false, message: 'No file uploaded' });
	} else if (req.files.docs.length !== 2) {
		res.status(400).send({ status: false, message: 'Maximum 2 files can be compared at a time' });
	} else {
		const chkSvc = container.resolve('checkService');
		chkSvc.processData(req.files.docs, true)
			.then((result) => {
				const retVal = {
					response: result.data,
					diffLink: `${req.headers.host}/api/docx/getDiffImage?sessionId=${result.sessionId}`,
					imageLinks: [
						{ url: `${req.headers.host}/api/docx/getImage?sessionId=${result.sessionId}&index=1` },
						{ url: `${req.headers.host}/api/docx/getImage?sessionId=${result.sessionId}&index=2` }
					]
				};
				res.send(retVal);
			})
			.catch((error) => {
				res.status(500).send(error);
			});
	}
});

/**
 * Receives n docx and converts them the the standard png used for comparison
 * POST
 * req.files.docs can be either single or multiple files
 * returns a status code with a json result object including
 *  formed links to the images produced
 */
app.post('/api/docx/convertDocX', urlencoderParser, async(req, res) => {
	if (!req.files) {
		res.send({ status: false, message: 'No file uploaded' });
	} else {
		const chkSvc = container.resolve('checkService');
		chkSvc.processData(req.files.docs, false)
			.then((result) => {
				res.send(result);
			})
			.catch((error) => {
				res.status(500).send(error);
			});
	}
});

/**
 * getDiffImage returns the diff image from a specific session
*/
app.get('/api/docx/getDiffImage', urlencoderParser, async(req, res) => {
	const session = req.query.sessionId;
	const path = `./uploads/${session}/diff.png`;
	if (!fs.existsSync(path)) {
		console.log(`${path} not found`); // No such file or any other kind of error
		return res.sendStatus(400);
	}
	res.sendFile(`./uploads/${session}/diff.png`, { root: root });
});

/**
 * getDiffImage returns the one of the images from a specific session
*/
app.get('/api/docx/getImage', urlencoderParser, async(req, res) => {
	const session = req.query.sessionId;
	const index = req.query.index;
	const path = `./uploads/${session}/image-${index}.png`;
	if (!fs.existsSync(path)) {
		console.log(`${path} not found`); // No such file or any other kind of error
		return res.sendStatus(400);
	}
	res.sendFile(path, { root: root });
});

/**
 * getDiffImage returns the diff image from a specific session
 * as a byte stream
*/
app.get('/api/docx/getDiffImageStream', urlencoderParser, async(req, res) => {
	const session = req.query.sessionId;
	const path = `./uploads/${session}/diff.png`;
	if (!fs.existsSync(path)) {
		console.log(`${path} not found`); // No such file or any other kind of error
		return res.sendStatus(400);
	}
	const r = fs.createReadStream(path); // or any other way to get a readable stream
	const ps = new stream.PassThrough();
	stream.pipeline(r, ps, (err) => {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}
	});
	ps.pipe(res);
});

/**
 * Produces a the app main info page (to be developed)
*/
app.get('/', urlencoderParser, async(req, res) => {
	res.sendFile(path.join(root, '/src/index.html'));
});

/**
 * Produces a the app help page (to be developed)
*/
app.get('/help', urlencoderParser, async(req, res) => {
	res.sendFile(path.join(root, '/src/help.html'));
});

export default app;
