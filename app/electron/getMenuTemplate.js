'use strict';

const { app, dialog } = require('electron');

const isMac = process.platform === 'darwin';
module.exports = function(window) {

	return [
		// { role: 'appMenu' }
		...(isMac ? [{
			label: app.name,
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{ role: 'services' },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideothers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		}] : []),
		// { role: 'fileMenu' }
		{
			label: 'File',
			submenu: [
				{
					label: 'Open',
					click: async() => {
						dialog.showOpenDialog({ properties: ['openFile'] })
							.then((result) => {
								console.log(result);
								window.webContents.send('procedureSelected', result.filePaths[0]);
							}).catch((err) => {
								console.log(err);
							});
					}
				},
				isMac ? { role: 'close' } : { role: 'quit' }
			]
		},
		// { role: 'editMenu' }
		{
			label: 'Edit',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
				...(isMac ? [
					{ role: 'pasteAndMatchStyle' },
					{ role: 'delete' },
					{ role: 'selectAll' },
					{ type: 'separator' },
					{
						label: 'Speech',
						submenu: [
							{ role: 'startspeaking' },
							{ role: 'stopspeaking' }
						]
					}
				] : [
					{ role: 'delete' },
					{ type: 'separator' },
					{ role: 'selectAll' }
				])
			]
		},
		// { role: 'viewMenu' }
		{
			label: 'View',
			submenu: [
				{ role: 'reload' },
				{ role: 'forcereload' },
				{ role: 'toggledevtools' },
				{ type: 'separator' },
				{ role: 'resetzoom' },
				{ role: 'zoomin' },
				{ role: 'zoomout' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' }
			]
		},
		{
			role: 'help',
			submenu: [
				{
					label: 'Learn More',
					click: async() => {
						const { shell } = require('electron');
						await shell.openExternal('https://github.com/xOPERATIONS/maestro');
					}
				}
			]
		}
	];
};
