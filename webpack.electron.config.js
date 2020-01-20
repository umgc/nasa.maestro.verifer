const path = require('path');
// const webpack = require('webpack');

module.exports = {

	mode: 'development',

	// https://webpack.js.org/configuration/target/
	target: 'electron-preload',

	// or --> entry: { editor: 'editor.js', execute: 'execute.js' }
	entry: './webpack-electron.js',

	output: {
		path: path.resolve('build/'),

		// If using multiple entry points, do something like this:
		// filename: "[name].bundle.js"
		// filename: "[chunkhash].bundle.js"
		filename: 'electron-bundle.js'
	},

	plugins: [],

	// The base directory, an absolute path, for resolving entry points and loaders from
	// configuration. By default the current directory is used, but it's recommended to pass a
	// value in your configuration. This makes your configuration independent from CWD (current
	// working directory).
	// context: path.resolve(__dirname, 'src'),

	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: true
						}
					}
				]
			}
		]

	}
};
