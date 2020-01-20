/* global maestro */

'use strict';

const { ipcRenderer } = require('electron');

const ElectronProgram = require('../model/ElectronProgram');

ipcRenderer.on('procedureSelected', function(event, filepath) {
	console.log(event);
	console.log(filepath);
	maestro.app.loadProcedure(filepath); // FIXME attempt to remove global ref
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
