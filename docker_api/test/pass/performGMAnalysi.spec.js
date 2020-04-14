'use strict';

import chai from 'chai';
import * as app from '../src/checkerService.js'; // Our app

// compare images
describe('compare two images', () => {
	const session = 'sts-134';
	const options = {
		tolerance: 0.02,
		highlightColor: 'red',
		render: false
	};

	// eslint-disable-next-line no-undef
	it('should be equal!', async() => {
		const fileNames = ['STS-134_EVA_1.png', 'STS-134_EVA_2.png'];
		return app.performGMAnalysis(session, fileNames, options)
			.then((res) =>{
				// console.log(res);
				// res.isEqual if two images are equal
				chai.expect(res.isEqual).to.be.true;
			});
	});

	// eslint-disable-next-line no-undef
	it('should not be equal!', async() => {
		const fileNames = ['STS-134_EVA_1.png', 'nasa-main.png'];
		return app.performGMAnalysis(session, fileNames, options)
			.then((res) =>{
				// console.log(res);
				// res.isEqual if two images are unequal
				chai.expect(res.isEqual).to.be.false;
			}).catch((err) =>{

			});
	});
});
