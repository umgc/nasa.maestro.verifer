'use strict';

const path = require('path');
const nunjucks = require('nunjucks');
const envHelper = require('../helpers/envHelper');

let loader;
if (envHelper.isNode) {
	loader = new nunjucks.FileSystemLoader(path.join(__dirname, '../writer/nunjucks-templates'));
} else {
	loader = new nunjucks.WebLoader('/maestro-views');
}

const nunjucksEnvironment = new nunjucks.Environment(
	loader,
	{ autoescape: false }
);
const filters = require('../helpers/filters');

// create a unique string to be used as an HTML ID attribute in the form of:
//   'lowercasedstring-hash'
nunjucksEnvironment.addFilter('idattr', filters.uniqueHtmlId);

module.exports = nunjucksEnvironment;
