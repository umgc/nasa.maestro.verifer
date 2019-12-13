'use strict';

const path = require('path');

const express = require('express');
const nunjucks = require('../model/nunjucksEnvironment');

const consoleHelper = require('../helpers/consoleHelper');

module.exports = class Server {

	constructor(program) {

		this.procedureFiles = program.getProjectProcedureFiles();
		this.baseHtmlFile = program.getProjectHtmlFile();
		if (!this.baseHtmlFile) {
			consoleHelper.noExitError('No HTML files found in /build directory. Try running `maestro compose --html` first');
			process.exit();
		}

		this.app = express();
		this.port = 8000;

		this.staticResources = [
			// Serve project resources
			{ webPath: 'build', localBase: program.projectPath, localRelative: 'build' },
			{ webPath: 'procedures', localBase: program.projectPath, localRelative: 'procedures' },
			{ webPath: 'tasks', localBase: program.projectPath, localRelative: 'tasks' },

			// Serve application resources
			{ webPath: 'maestro', localBase: __dirname, localRelative: '../../build' },
			{ webPath: 'maestro-views', localBase: __dirname, localRelative: '../view' }
		];
	}

	setPort(newPort) {
		newPort = parseInt(newPort);
		if (!newPort || newPort < 1025) {
			const tooSmall = newPort < 1025 ?
				'\n  Please pick an integer over 1024' :
				'';
			const recommend = '\n  Recommended options: 3000, 8000, 8080, 9000';
			consoleHelper.error(`port ${newPort} is invalid.${tooSmall}${recommend}`);
		}
		this.port = newPort;
		return this;
	}

	setupStatic() {
		for (const resource of this.staticResources) {
			this.app.use(
				`/${resource.webPath}`,
				express.static(path.join(
					resource.localBase,
					resource.localRelative
				))
			);
		}
		return this;
	}

	serve() {
		this.app.get('/', (req, res) => {
			// res.sendFile(this.baseHtmlFile);
			res.send(nunjucks.render('document.html', {
				title: 'Maestro',
				procedureFiles: this.procedureFiles
			}));
		});

		this.app.listen(this.port, () => {
			consoleHelper.success(
				`Visit http://localhost:${this.port} in your web browser. Type ctrl-c here to exit`
			);
		});
	}
};
