'use strict';

const path = require('path');
const childProcess = require('child_process');
const shell = require('electron').shell;

const { ipcRenderer } = require('electron');

const ElectronProgram = require('../model/ElectronProgram');

ipcRenderer.on('procedureSelected', function(event, filepath) {
	console.log(event);
	console.log(filepath);
	window.maestro.app.loadProcedure(filepath);
});

if (!window.maestro) {
	window.maestro = {};
}
window.maestro.app = new ElectronProgram(window.appComponent);

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

console.log(`     __  ______    _____________________  ____
    /  |/  /   |  / ____/ ___/_  __/ __ \\/ __ \\
   / /|_/ / /| | / __/  \\__ \\ / / / /_/ / / / /
  / /  / / ___ |/ /___ ___/ // / / _, _/ /_/ /
 /_/  /_/_/  |_/_____//____//_/ /_/ |_|\\____/ v${window.maestro.app.version}`);
