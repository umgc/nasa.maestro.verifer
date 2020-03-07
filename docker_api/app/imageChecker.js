/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable max-len */
import Rembrandt from 'rembrandt';
import path from 'path';

export default class ImageChecker {
	constructor() {
    	this.imageA = path.resolve() + '/img1.jpg';
    	this.imageB = path.resolve() + '/img2.jpg';
	}

	async checkDifference(threshold = 0, delta = 0, offset = 0, render = false) {
    	const rembrandt = new Rembrandt({
    		// `imageA` and `imageB` can be either Strings (file path on node.js, public url on Browsers) or Buffers
    		imageA: this.imageA, imageB: this.imageB,
    		// imageB: fs.readFileSync('/path/to/imageB'),
    		thresholdType: Rembrandt.THRESHOLD_PERCENT, // either THRESHOLD_PERCENT or THRESHOLD_PIXELS
    		maxThreshold: threshold, //  (0...1 for THRESHOLD_PERCENT, pixel count for THRESHOLD_PIXELS
    		maxDelta: delta, // Maximum color delta (0...1):
    		maxOffset: offset, // Maximum surrounding pixel offset
    		renderComposition: render, // Should Rembrandt render a composition image?
    		compositionMaskColor: Rembrandt.Color.RED // Color of unmatched pixels
    	});

    	var retVal = await rembrandt.compare()
    		.then(function(result) {
    			console.log('Passed:', result.passed);
    			console.log('Pixel Difference:', result.differences, 'Percentage Difference', result.percentageDifference, '%');
    			console.log('Composition image buffer:', result.compositionImage);
    			return result;
    		})
    		.catch((e) => console.error(e));
    	return retVal;
	}

}
