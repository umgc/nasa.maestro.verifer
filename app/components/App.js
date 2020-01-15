/* global maestro */
const React = require('react');
const cloneDeep = require('lodash/cloneDeep');
const jsdiff = require('diff');
const YAML = require('js-yaml');

const stateHandler = require('../state/index');
// const PropTypes = require('prop-types');
const HeaderComponent = require('./layout/HeaderComponent');
const ProcedureViewerComponent = require('./pages/ProcedureViewerComponent');
const ProcedureSelectorComponent = require('./pages/ProcedureSelectorComponent');
const ReactProcedureWriter = require('../writer/procedure/ReactProcedureWriter');

const changes = {
	lastDefinitionYaml: null,
	diffs: []
};

function recordAndReportChange(latestProcedure) {
	const newYaml = YAML.dump(latestProcedure.getDefinition());

	const diff = jsdiff.diffLines(
		changes.lastDefinitionYaml,
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

	changes.diffs.push(diffText);

	console.log(diffText, ...css);
	changes.lastDefinitionYaml = newYaml;

}

function saveChange(procedure, activityIndex) {
	const activity = procedure.tasks[activityIndex];

	// const xhr = new XMLHttpRequest();
	// xhr.open('POST', `edit/tasks/${activity.taskReqs.file}`, true);
	// xhr.setRequestHeader('Content-Type', 'application/json');
	// xhr.send(JSON.stringify({
	// yaml: YAML.dump(activity.getTaskDefinition())
	// }));

	fetch(
		`edit/tasks/${activity.taskReqs.file}`,
		{
			method: 'POST', // or 'PUT'
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				yaml: YAML.dump(activity.getTaskDefinition())
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

class App extends React.Component {
	state = {
		procedure: null
	};

	setProcedure = (procObject) => {
		stateHandler.state.procedure = procObject;
		changes.lastDefinitionYaml = YAML.dump(procObject.getDefinition());

		this.setState({
			procedure: stateHandler.state.procedure,
			procedureWriter: new ReactProcedureWriter(maestro.app, procObject)
		});

		stateHandler.modifyStep = (actIndex, divIndex, colKey, stepIndex, rawDefinition) => {
			// overkill? FIXME try without
			const newProc = cloneDeep(this.state.procedure);

			const division = newProc.tasks[actIndex].concurrentSteps[divIndex];
			const newStep = division.makeStep(colKey, rawDefinition);

			division.subscenes[colKey][stepIndex] = newStep;

			recordAndReportChange(newProc);

			saveChange(newProc, actIndex);

			this.setState({
				procedure: newProc
			});

		};

		maestro.react = { app: this }; // for testing/playing with react FIXME remove later
		console.log(`Procedure set to ${procObject.name}`);
	};

	getProcedureWriter = () => {
		return this.state.procedureWriter;
	}

	render() {
		return (
			<div className='app'>
				<div className='container'>
					<HeaderComponent />
					{!this.state.procedure ? (
						<ProcedureSelectorComponent
							procedureChoices={window.procedureChoices}
							procedure={this.state.procedure}
							setProcedure={this.setProcedure} />
					) : (
						<ProcedureViewerComponent
							procedure={this.state.procedure}
							getProcedureWriter={this.getProcedureWriter}
						/>
					)}
				</div>
			</div>
		);
	}
}

module.exports = App;
