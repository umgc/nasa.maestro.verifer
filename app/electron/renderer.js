'use strict';

const path = require('path');
const childProcess = require('child_process');
const shell = require('electron').shell;

const { ipcRenderer } = require('electron');

const ElectronProgram = require('../model/ElectronProgram');

// Handles fresult of selecting a procedure file after doing File-->Open
// FIXME: No error handling for invalid file (i.e. not a procedure file)
ipcRenderer.on('procedureSelected', function(event, filepath) {
	console.log('ipcRenderer.on --> procedureSelected');
	console.log(event);
	console.log(filepath);
	window.maestro.app.loadProcedure(filepath);
});

// Handles result of selecting a directory after doing File-->New Project
ipcRenderer.on('initNewProject', function(event, dirpath) {
	console.log('ipcRenderer.on --> initNewProject');
	console.log(event);
	console.log(dirpath);
	window.maestro.state.setState({

		// FIXME: If this is the last item in this object, then it does not get set. That indicates
		// that there is an issue with setting modalType that is silently failing.
		initProjectParentPath: dirpath,
		modalVisible: true,
		modalType: 'INIT_PROJECT' // FIXME why does this have to be last?
	});
	console.log('state now', window.maestro.state.state);
});

if (!window.maestro) {
	window.maestro = {};
}
window.maestro.app = new ElectronProgram(window.appComponent);

// FIXME: documentation. This function has to be here because this file is not run through Webpack,
// and the child_process module cannot be webpacked. Though that doesn't actually apply to Electron
// necessarily since its webpack target is 'electron-preload' instead of 'web'
window.maestro.exportToWord = function(procedureOutputFilename, successFn, failureFn) {
	const maestroEntry = path.resolve(__dirname, '../../index.js');
	const projectPath = window.maestro.app.projectPath;
	childProcess.exec(
		`node "${maestroEntry}" compose --eva-docx "${projectPath}"`,
		(error, stdout, stderr) => {
			if (error) {
				failureFn(error, stdout, stderr);
			} else {
				successFn(stdout, stderr);
				shell.openItem(path.join(projectPath, 'build', procedureOutputFilename));
			}
		}
	);
};

// See FIXME above
window.maestro.initGitRepoAndFirstCommit = function(projectPath) {
	const output = [];
	const commands = [
		'git init',
		'git add .',
		'git commit -m "Initial commit"'
	];

	for (const cmd of commands) {
		try {
			console.log(`Running git command on new repository: ${cmd}`);
			output.push(
				// FIXME don't use sync version here
				childProcess
					.execSync(`cd ${projectPath} && ${cmd}`)
					.toString()
					.trim()
			);
		} catch (error) {
			console.error(error);
			return { error, output };
		}
	}
	return { output };
};

console.log(`     __  ______    _____________________  ____
    /  |/  /   |  / ____/ ___/_  __/ __ \\/ __ \\
   / /|_/ / /| | / __/  \\__ \\ / / / /_/ / / / /
  / /  / / ___ |/ /___ ___/ // / / _, _/ /_/ /
 /_/  /_/_/  |_/_____//____//_/ /_/ |_|\\____/ v${window.maestro.app.version}`);
