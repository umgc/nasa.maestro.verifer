'use strict';

module.exports = function(/* imagePath */) {
	// ! Ultimately do something like:
	// var img = new Image();
	// img.onload = function() {
	// alert(this.width + 'x' + this.height);
	// };
	// img.src = imagePath;

	// For now, just:
	return { width: 100, height: 100 };
};
