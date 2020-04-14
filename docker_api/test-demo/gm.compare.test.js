import fs from 'fs';
import path from 'path';
import PDFImage from 'pdf-image';
import unoconv from 'unoconv-promise';
// import uuid from 'uuidv4';
import gm from 'gm';

// const __dirname =
const session = 'sts-134';
const png1 = path.join(__dirname, '../projects', session, 'STS-134_EVA_1.png');
const png2 = path.join(__dirname, '../projects', session, 'STS-134_EVA_2.png');
console.log(png1);

const options = {
	file: path.join(__dirname, './projects', session, 'STS-134_EVA_diff.png'),
	highlightColor: 'red',
	tolerance: 0.01,
	highlightStyle: 'assign',
	metric: 'mae'
};
gm.compare(png1, png2, options,
	async(err, isEqual, equality, raw, path1, path2) => {
		if (err) {
			console.log(err);
		}
		console.log(isEqual);
		console.log(raw);
		console.log(equality);
	}
);
