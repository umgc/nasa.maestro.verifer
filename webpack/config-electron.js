const path = require('path');
// const webpack = require('webpack');

// common config between web and electron
const moduleRules = require('./common/module-rules');
const configContext = require('./common/configContext');

module.exports = {

	mode: 'development',

	// https://webpack.js.org/configuration/target/
	target: 'electron-preload',

	// or --> entry: { editor: 'editor.js', execute: 'execute.js' }
	entry: path.resolve(__dirname, 'entry-electron.js'),

	output: {
		path: path.resolve('build/'),

		// If using multiple entry points, do something like this:
		// filename: "[name].bundle.js"
		// filename: "[chunkhash].bundle.js"
		filename: 'electron-bundle.js'
	},

	// Electron does not need to supply the mocks for things like fs, child_process, etc, since it
	// has the full Node.js API.
	plugins: [],

	context: configContext,
	module: { rules: moduleRules }
};
