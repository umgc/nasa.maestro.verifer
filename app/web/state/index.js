'use strict';

const fs = require('fs');
const path = require('path');
const YAML = require('js-yaml');
const jsdiff = require('diff');

const Procedure = require('../../model/Procedure');
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
	if (taskOrProcedure instanceof Procedure) {
		return {
			basepath: state.program.procedurePath,
			filename: state.procedure.procedureFile
		};
	} else if (taskOrProcedure instanceof Task) {
		return {
			basepath: state.program.tasksPath,
			filename: taskOrProcedure.taskReqs.file
		};
	}
	throw new Error('taskOrProcedure must be Task or Procedure');
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
	// console.log('------------------------->', p);
	// console.log(' --------- program --->', state.program);
	// console.log(taskOrProcedure);
	// return; // FIXME remove this stuff
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
	recordAndReportChange: recordAndReportChange
};
