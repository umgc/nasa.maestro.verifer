'use strict';

const path = require('path');
const nunjucks = require('nunjucks');
const nunjucksEnvironment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(path.join(__dirname, '../view')),
	{ autoescape: false }
);
const filters = require('../helpers/filters');

// create a unique string to be used as an HTML ID attribute in the form of:
//   'lowercasedstring-hash'
nunjucksEnvironment.addFilter('idattr', filters.uniqueHtmlId);

module.exports = nunjucksEnvironment;
