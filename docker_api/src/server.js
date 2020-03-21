#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import stream from 'stream';
import path from 'path';

import CheckerService from './checkerService.js';

// TODO refactor to implement dependency injection https://blog.risingstack.com/dependency-injection-in-node-js/
const root = path.resolve();

const app = express();
const urlencoderParser = bodyParser.json();
const port = process.env.port || 3000;
const svc = new CheckerService();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({ createParentPath: true }));

// Starts the Api service
app.listen(port, () => {
	console.log('Server is started on http://localhost:' + port);
});

// POST
// receives a docx document and verifies it's valid
app.post('/api/docx/validate', urlencoderParser, function(req, res) {
	console.log(req.body, '1 Row Added.');
	res.send('1 Row Added.');
});

// POST
// Receives an output docx and compares it to a set image of a previous docx
// Returns a percent difference
app.post('/api/docx/checkDifference', urlencoderParser, async(req, res) => {
	console.log(req.body, 'Calculating difference between document outputs.');
	if (!req.files) {
		res.send({ status: false, message: 'No file uploaded' });
	} else {
		svc.checkDifference(
			req.files, req.body.threshold, req.body.color, req.body.render
		).then((result) => {
			const retVal = {
				response: result.data,
				link: `${req.headers.host}/api/docx/getDiffImage?sessionId=${result.sessionId}`
			};
			res.send(retVal);
		}).catch((error) => {
			res.status(500).send(error);
		});
	}
});

app.get('/api/docx/getDiffImage', urlencoderParser, async(req, res) => {
	console.log(req.query);
	const session = req.query.sessionId;
	const path = `./uploads/${session}/diff.png`;
	if (!fs.existsSync(path)) {
		console.log(`${path} not found`); // No such file or any other kind of error
		return res.sendStatus(400);
	}
	res.sendFile(`./uploads/${session}/diff.png`, { root: root });
});

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

export default app;
