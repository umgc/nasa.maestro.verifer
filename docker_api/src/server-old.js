#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';

import CheckerService from './checkerService.js';
import UnoService from './unoService.js';

// TODO refactor to implement dependency injection https://blog.risingstack.com/dependency-injection-in-node-js/

const app = express();
const urlencoderParser = bodyParser.json();
const port = process.env.port || 3000;
const svc = new CheckerService();
const unoSvc = new UnoService().listen();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({ createParentPath: true }));

// Starts the unoconv listener
unoSvc.stderr.on('data', (data) => {
	console.log('stderr: ' + data.toString('utf8'));
});

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
			console.log('retval => ', result);
			res.send(result);
		}).catch((error) => {
			res.status(500).send(error);
		});
	}
});

export default app;
