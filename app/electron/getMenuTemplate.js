'use strict';

const { dialog } = require('electron');

/**
 * @param {string} label
 * @param {Array} submenu
 * @return {Object}
 */
function menu(label, submenu = []) {
	const menu = {};
	menu.label = label;
	menu.submenu = submenu;
	return menu;
}

const isMac = process.platform === 'darwin';

const macEditMenuExtras = [
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
];

const nonMacEditMenuExtras = [
	{ role: 'delete' },
	{ type: 'separator' },
	{ role: 'selectAll' }
];

/**
 * Get the template for the menu at the top of the window
 *
 * @param {BrowserWindow} window  Reference to Electron BrowserWindow object
 * @return {Array}                Ex: [{ label: 'File', submenu: [...] }, {label: ...} ]
 */
function getMenuTemplate(window) {

	return [
		...(isMac ? [{ role: 'appMenu' }] : []),
		menu('File', [
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
		]),
		menu('Edit', [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			...(isMac ? macEditMenuExtras : nonMacEditMenuExtras)
		]),
		menu('View', [
			{ role: 'reload' },
			{ role: 'forcereload' },
			{ role: 'toggledevtools' },
			{ type: 'separator' },
			{ role: 'resetzoom' },
			{ role: 'zoomin' },
			{ role: 'zoomout' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
		]),
		menu('Help', [
			{
				label: 'Learn More',
				click: async() => {
					const { shell } = require('electron');
					await shell.openExternal('https://github.com/xOPERATIONS/maestro');
				}
			}
		])
	];
}

module.exports = getMenuTemplate;
