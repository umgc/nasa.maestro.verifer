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
app.post('/api/docx/validate', urlencoderParser, function(req, res) {
	console.log(req.body, '1 Row Added.');
	res.send('1 Row Added.');
});

app.post('/api/docx/showDifferences', urlencoderParser, function(req, res) {
	console.log(req.body, '1 column Added.');
	const ret = path.join(__dirname + '/index.html');
	res.sendFile(ret);
});
