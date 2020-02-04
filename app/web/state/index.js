'use strict';

const fs = require('fs');
const path = require('path');
const YAML = require('js-yaml');
const jsdiff = require('diff');

// const Procedure = require('../../model/Procedure');
const Task = require('../../model/Task');

const state = {};

// FIXME should this be in state too?
const changesDiffs = [];

/**
 *
 * @param {*} changes
 */
function setState(changes) {
	for (const prop in changes) {
		const change = changes[prop];
		state[prop] = change;
	}
	// FIXME add subscription
}

/**
 * Compare procedure against previous version of procedure. Record state for comparison with future
 * changes and console.log() a diff from the previous change.
 *
 * FIXME: does this belong in stateHandler?
 */
function recordAndReportChange() {
	const newYaml = YAML.dump(state.procedure.getDefinition());

	const diff = jsdiff.diffLines(
		state.lastProcDefinitionYaml,
		newYaml
	);

	const css = [];

	const diffText = diff
		.map((change) => {
			if (change.added) {
				css.push('color: green');
				return `%c+ ${change.value.trimEnd()}`;
			} else if (change.removed) {
				css.push('color: red');
				return `%c- ${change.value.trimEnd()}`;
			} else {
				css.push('color: gray');
				return `%c  (${change.count} unchanged line${change.count === 1 ? '' : 's'})`;
			}
		})
		.join('\n');

	changesDiffs.push(diffText);

	// FIXME reenable this!
	// console.log(diffText, ...css);
	setState({ lastProcDefinitionYaml: newYaml });

}

/**
 *
 */
function getPathParts(taskOrProcedure) {

	// FIXME
	// checking instanceof may be problematic in Electron on Windows in some cases. Need to read [1]
	// to fully understand. For now, just check constructor name.
	// [1] https://github.com/electron/electron/issues/1289
	if (taskOrProcedure.constructor.name === 'Procedure') {
		return {
			basepath: state.program.proceduresPath,
			filename: state.procedure.procedureFile
		};
	} else if (taskOrProcedure.constructor.name === 'Task') {
		return {
			basepath: state.program.tasksPath,
			filename: taskOrProcedure.taskReqs.file // electron this is full path, web just filename
		};
	}

	throw new Error('taskOrProcedure must be Task or Procedure');
}

/**
 *
 * @param {*} path
 */
function exists(path) {
	fetch(
		path,
		{
			method: 'POST' // or 'PUT'
		}
	)
		.then((response) => response.json())
		.then((data) => {
			console.log('Success:', data);
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

/**
 *
 */
function moveFileElectron(taskOrProcedure, newFilename, completeFn) {
	const p = getPathParts(taskOrProcedure);
	const src = path.join(p.basepath, p.filename);
	const dest = path.join(p.basepath, newFilename);
	console.log(`moving file from ${src} to ${dest}`);
	state.program.moveFile(
		src,
		dest,
		completeFn,
		completeFn
	);
}
/**
 *
 */
function moveFileWeb(taskOrProcedure, newFilename, completeFn) {
	const p = getPathParts(taskOrProcedure);
	fetch(
		`move/${p.basepath}/${p.filename}/${newFilename}`,
		{
			method: 'POST' // or 'PUT'
		}
	)
		.then((response) => response.json())
		.then((data) => {
			console.log('Success:', data);
			completeFn(data);
		})
		.catch((error) => {
			console.error('Error:', error);
			completeFn(error);
		});
}

/**
 *
 */
function moveFile(taskOrProcedure, newFilename, completeFn = function() {}) {
	if (window.isElectron) {
		moveFileElectron(taskOrProcedure, newFilename, completeFn);
	} else {
		moveFileWeb(taskOrProcedure, newFilename, completeFn);
	}
}

/**
 * Save yamlString to Activity file
 *
 * @param {Task|Procedure} taskOrProcedure  Task or Procedure object
 * @param {string} yamlString
 */
function saveChangeElectron(taskOrProcedure, yamlString) {
	const p = getPathParts(taskOrProcedure);
	fs.writeFile(
		path.join(p.basepath, p.filename),
		yamlString,
		{},
		(err) => {
			if (err) {
				throw err;
			}
		}
	);
}

/**
 * Save yamlString to Activity file
 *
 * @param {Task|Procedure} taskOrProcedure
 * @param {string} yamlString
 */
function saveChangeWeb(taskOrProcedure, yamlString) {
	const p = getPathParts(taskOrProcedure);
	fetch(
		`edit/${p.basepath}/${p.filename}`,
		{
			method: 'POST', // or 'PUT'
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				yaml: yamlString
			})
		}
	)
		.then((response) => response.json())
		.then((data) => {
			console.log('Success:', data);
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

/**
 * Save changes for a particular Activity
 *
 * @param {number} activityIndex                Index Activity to save to file
 */
function saveChange(activityIndex) {
	const activity = state.procedure.tasks[activityIndex];
	const yamlString = YAML.dump(activity.getTaskDefinition());

	if (window.isElectron) {
		saveChangeElectron(activity, yamlString);
	} else {
		saveChangeWeb(activity, yamlString);
	}

	recordAndReportChange();
}

/**
 *
 */
function saveProcedureChange() {
	const yamlString = YAML.dump(state.procedure.getOnlyProcedureDefinition());

	if (window.isElectron) {
		saveChangeElectron(state.procedure, yamlString);
	} else {
		saveChangeWeb(state.procedure, yamlString);
	}

	recordAndReportChange();
}

module.exports = {
	state: state,
	setState: setState,
	saveChange: saveChange,
	saveProcedureChange: saveProcedureChange,
	recordAndReportChange: recordAndReportChange,
	exists: exists,
	moveFile: moveFile
};
