import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import ImageChecker from './app/imageChecker.js';
import { upload } from './app/uploadMiddleware.js';

const app = express();
const urlencoderParser = bodyParser.json();
const port = process.env.port || 3000;
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.resolve();
const checker = new ImageChecker();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Api code here
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
app.post('/api/docx/showDifferences', upload.single, function(req, res) {
	console.log(req.body, '1 column Added.');
	console.log(__dirname);
	const ret = path.join(__dirname + '/index.html');
	res.sendFile(ret);
});

// POST
// Receives an output docx and compares it to a set image of a previous docx
// Returns a percent difference
app.post('/api/docx/checkDifference', urlencoderParser, function(req, res) {
	console.log(req.body, 'Calculating difference between document outputs.');

	checker.checkDifference(0.01, 0.02)
		.then((result) => {
			console.log('retval => ', result);
			res.send(result);
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});
