/* global maestro */
// FIXME attempt to remove global ref

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const App = require('../app/web/components/App');
const stepModules = require('../app/writer/step-mods/stepModules');

// window.maestro = {};
// maestro.app = new maestro.WebProgram();
// maestro.app = new maestro.ElectronProgram();

// window.maestro = maestro;

const app = <App />;
ReactDOM.render(app, document.getElementById('root'));

if (!window.maestro) {
	window.maestro = {};
}

maestro.react = { app: app }; // for testing/playing with react FIXME remove later
maestro.reactStepModuleFunctions = {};

for (const mod of stepModules) {
	console.log(`attempting step module react function for ${mod.class}`);
	try {
		maestro.reactStepModuleFunctions[`${mod.class}React`] = require(
			`../app/writer/step-mods/${mod.class}React`
		);
		console.log('added');
	} catch (e) {
		console.log(`No React functions for ${mod.key}`);
		console.log(e);
	}
}
