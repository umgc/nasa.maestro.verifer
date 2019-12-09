'use strict';

const path = require('path');
const fs = require('fs');

const commander = require('commander');

const Program = require('./Program');
const Procedure = require('./Procedure');
const EvaDocxProcedureWriter = require('../writer/procedure/EvaDocxProcedureWriter');
const SodfDocxProcedureWriter = require('../writer/procedure/SodfDocxProcedureWriter');
const EvaHtmlProcedureWriter = require('../writer/procedure/EvaHtmlProcedureWriter');

const consoleHelper = require('../helpers/consoleHelper');

function handleProjectPath(projectPath) {
	if (projectPath) {
		return path.resolve(projectPath);
	}
	return process.cwd();
}

function pathMustExist(path, createIfMissing = false) {
	try {
		fs.statSync(path);
	} catch (e) {
		if (createIfMissing) {
			fs.mkdirSync(path); // catch here, too?
		} else {
			console.error(`Path ${path} does not exist`);
			process.exit();
		}
	}
	return true;
}

/**
 * Tests whether the specified path can be written to by this process
 *
 * @param   {string} pathToTest The path to test
 * @return  {boolean} True if path can be written to, false otherwise
 */
function canWrite(pathToTest) {

	//  Check whether the path exists
	if (!fs.existsSync(pathToTest)) {
		//  File doesn't exist - check permissions for the parent dir
		const p = path.parse(pathToTest);
		let dir = p.dir;

		if (dir === '') {
			dir = '.';
		}

		pathToTest = dir;
	}

	//  Test permissions
	try {
		fs.accessSync(pathToTest, fs.constants.W_OK);
		//  Yes
		return true;
	} catch (err) {
		//  No
		return false;
	}
}

module.exports = class CommanderProgram extends Program {

	constructor() {
		super();
		this.commander = commander;
		this.commander
			.version(this.version, '--version')
			.name(this.name)
			.description(this.description)
			.allowUnknownOption();
	}

	/**
	 * This function configures commander.js for this application's command line
	 * arguments, and attemps to parse the arguments passed to this process.
	 *
	 * @param   {*} args        Command line argument array (e.g. process.argv)
	 * @return  {*} TBD FIXME
	 */
	buildProgramArguments(args) {

		this.commander
			.command('compose [projectPath]')
			.description('Build products for a Maestro project')
			.option('-t, --template <.html>', 'specify a template to use')
			.option('--html', 'Generate HTML file', null)
			.option('--sodf', 'Generate SODF style procedure', null)

			// note: this will generate an options.evaDocx property, not noEvaDocx
			.option('--no-eva-docx', 'Don\'t generate the default EVA DOCX file', null)
			.option('-c, --css <.css>', 'CSS to append to generated HTML', null)
			.action((projectPath, options) => {
				this.projectPath = handleProjectPath(projectPath);

				this.sodf = options.sodf;
				this.html = options.html;
				this.evaDocx = options.evaDocx;
				this.template = options.template || path.join(
					__dirname, 'templates', 'spacewalk.njk'
				);
				this.validateProgramArguments();
				this.doCompose();
			});

		this.commander
			.command('conduct [projectPath]')
			.description('Serve Maestro web app')
			.option('-p, --port <num>', 'specify port on which to serve', 8000)
			.action((projectPath, options) => {
				this.projectPath = handleProjectPath(projectPath);
				this.port = parseInt(options.port);
				if (!this.port || this.port < 1025) {
					const tooSmall = this.port < 1025 ?
						'\n  Please pick an integer over 1024' :
						'';
					const recommend = '\n  Recommended options: 3000, 8000, 8080, 9000';
					consoleHelper.error(`port ${this.port} is invalid.${tooSmall}${recommend}`);
				}
				this.validateProgramArguments();

				const express = require('express');
				const app = express();

				app.use('/build', express.static(path.join(this.projectPath, 'build')));
				app.use('/procedures', express.static(path.join(this.projectPath, 'procedures')));
				app.use('/tasks', express.static(path.join(this.projectPath, 'tasks')));

				app.use('/maestro', express.static(path.resolve(__dirname, '../../build')));
				app.use('/maestro-views', express.static(path.resolve(__dirname, '../view')));

				const htmlFiles = fs.readdirSync(this.outputPath).filter((filename) => {
					return filename.endsWith('.html');
				});
				if (htmlFiles.length === 0) {
					consoleHelper.noExitError('No HTML files found in /build directory. Try running `maestro compose --html` first');
					process.exit();
				} else if (htmlFiles.length > 1) {
					consoleHelper.warn(`Multiple HTML files found in /build directory\nBeing lazy and using first one: ${htmlFiles[0]}`);
				}
				const htmlFile = path.join(this.outputPath, htmlFiles[0]);

				app.get('/', (req, res) => {
					res.sendFile(htmlFile);
				});

				app.listen(this.port, () => {
					consoleHelper.success(
						`Visit http://localhost:${this.port} in your web browser. Type ctrl-c here to exit`
					);
				});
			});

		//  Commander.js does an unhelpful thing if there are invalid options;
		//  Override the default behavior to do a more helpful thing.
		this.commander.unknownOption = function() {
			//  An invalid option has been received. Print usage and exit.
			this.commander.help();
		};

		try {
			this.commander.parse(args);
		} catch (e) {
			if (e instanceof TypeError) {
				//  Commander.js will annoyingly throw a TypeError if an argument
				//  that requires a parameter is missing its parameter.
				this.commander.help();
				console.log('\n');
				console.error(e);
			} else {
				throw e;
			}
		}

		return this.commander;
	}

	/**
	 * Validates the arguments...
	 *
	 */
	validateProgramArguments() {

		this.procedurePath = path.join(this.projectPath, 'procedures');
		this.tasksPath = path.join(this.projectPath, 'tasks');
		this.imagesPath = path.join(this.projectPath, 'images');
		this.outputPath = path.join(this.projectPath, 'build');
		this.gitPath = path.join(this.projectPath, '.git');

		pathMustExist(this.procedurePath);
		pathMustExist(this.tasksPath);

		// at this point tasks and procedures paths exist. Reasonably certain this
		// is an xOPS project. Allow forcing creation of outputPath with `true`.
		pathMustExist(this.outputPath, true);

		//  If this process can't write to the output location, emit an error and quit
		if (!canWrite(this.outputPath)) {
			console.error(`Can't write to output location: ${this.outputPath}`);
			process.exit();
		}

	}

	doCompose() {
		fs.readdir(this.procedurePath, (err, files) => {
			if (err) {
				console.log(`Unable to scan procedures directory: ${err}`);
				process.exit();
			}
			files.forEach((file) => {
				console.log(`Generating procedure from ${file}`);

				const procedureFile = path.join(this.procedurePath, file);

				// Parse the input file
				const procedure = new Procedure();
				const err = procedure.addProcedureDefinitionFromFile(procedureFile);

				// Check if an error occurred
				if (err) {
					consoleHelper.noExitError(`Error while processing procedure ${file}: ${err}`);
					if (err.validationErrors) {
						consoleHelper.noExitError('Validation Errors:');
						consoleHelper.noExitError(err.validationErrors);
					}
					return;
				}

				if (this.evaDocx) {
					console.log('Creating EVA format');
					const eva = new EvaDocxProcedureWriter(this, procedure);

					eva.renderIntro(() => {
						eva.renderTasks();
						eva.writeFile(path.join(
							this.outputPath,
							`${procedure.filename}.docx`
						));
					});
				}

				if (this.sodf) {
					console.log('Creating SODF format');
					const sodf = new SodfDocxProcedureWriter(this, procedure);
					sodf.renderTasks();
					sodf.writeFile(path.join(
						this.outputPath,
						`${procedure.filename}.sodf.docx`
					));
				}

				if (this.html) {
					console.log('Creating EVA HTML format');
					const evaHtml = new EvaHtmlProcedureWriter(this, procedure);
					evaHtml.renderIntro();
					evaHtml.renderTasks();
					evaHtml.writeFile(path.join(
						this.outputPath,
						`${procedure.filename}.eva.html`
					));
				}

			});
		});
	}
};
