'use strict';

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

console.log(`     __  ______    _____________________  ____
    /  |/  /   |  / ____/ ___/_  __/ __ \\/ __ \\
   / /|_/ / /| | / __/  \\__ \\ / / / /_/ / / / /
  / /  / / ___ |/ /___ ___/ // / / _, _/ /_/ /
 /_/  /_/_/  |_/_____//____//_/ /_/ |_|\\____/ v${window.maestro.app.version}`);
