import Rembrandt from 'rembrandt';
import path from 'path';

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.resolve();

const checkDifference = async function(threshold = 0, delta = 0, offset = 0, render = false) {
	const rembrandt = new Rembrandt({
		// `imageA` and `imageB` can be either Strings (file path on node.js,
		// public url on Browsers) or Buffers
		imageA: __dirname + '/img1.jpg', imageB: __dirname + '/img2.jpg',
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
};

export { checkDifference };
