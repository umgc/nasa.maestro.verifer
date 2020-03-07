import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';

const urlencoderParser = bodyParser.json();

const app = express();
const port = process.env.port || 3000;

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
app.post('/api/docx/showDifferences', urlencoderParser, function(req, res) {
	console.log(req.body, '1 column Added.');
	const ret = path.join(__dirname + '/index.html');
	res.sendFile(ret);
});

// POST
// Receives an output docx and compares it to a set image of a previous docx
// Returns a percent difference
app.post('/api/docx/calcDifference', urlencoderParser, function(req, res) {
	console.log(req.body, 'Calculating difference between document outputs.');
	const ret = 0.03;
	res.send(ret);
});


