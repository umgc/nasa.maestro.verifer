'use strict';

const crypto = require('crypto');
const path = require('path');
const nunjucks = require('nunjucks');
const nunjucksEnvironment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(path.join(__dirname, '../view')),
	{ autoescape: false }
);

// create a unique string to be used as an HTML ID attribute in the form of:
//   'lowercasedstring-hash'
nunjucksEnvironment.addFilter('idattr', (str) => {
	// remove any non a-Z, 0-9 chars to avoid weirdness with chars like spaces and slashes in the ID
	const simplifiedName = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
	// hash the full string just in case there were other important chars
	// uppercase the string to ensure we're starting from the same set of chars
	const hash = crypto.createHash('md5').update(str.toUpperCase()).digest('hex');
	return `${simplifiedName}-${hash.slice(0, 9)}`;
});

module.exports = nunjucksEnvironment;
