const React = require('react');

const Procedure = require('../../../model/Procedure');
const Task = require('../../../model/Task');
const ConcurrentStep = require('../../../model/ConcurrentStep');
const Series = require('../../../model/Series');
const Step = require('../../../model/Procedure');

const stateHandler = require('../../state/index');

const ActivityMetaForm = require('./ActivityMetaForm');
const DivisionMetaForm = require('./DivisionMetaForm');

class SidebarComponent extends React.Component {

	state = {
		editorNode: null
	}

	constructor(props) {
		super(props);
		stateHandler.setEditorNode = (editorNode, options = {}) => {
			console.log('setEditorNode() -->', editorNode);
			this.setState({ editorNode: editorNode, editorNodeOptions: options });
		};
		stateHandler.unsetEditorNode = () => {
			console.log('unsetEditorNode()');
			this.setState({ editorNode: null, editorNodeOptions: {} });
		};
	}

	render() {
		for (const model of [Step, Series, ConcurrentStep, Task, Procedure]) {
			if (this.state.editorNode instanceof model) {
				return this[`render${model.name}Node`]();
			}
		}
		return this.renderNoEditorNode();
	}

	renderProcedureNode() {
		return <div>Sidebar Procedure editor not yet available</div>;
	}

	renderTaskNode() {
		return <ActivityMetaForm
			task={this.state.editorNode}
			editorOptions={this.state.editorNodeOptions}
		/>;
	}

	renderConcurrentStepNode() {
		return <DivisionMetaForm
			division={this.state.editorNode}
			editorOptions={this.state.editorNodeOptions}
		/>;
	}

	renderSeriesNode() {
		return <div>Sidebar Series editor not yet available</div>;
	}

	renderStepNode() {
		return <div>Sidebar Step editor not yet available</div>;
	}

	renderNoEditorNode() {

		const divStyle = {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			height: '100%',
			fontSize: '14px'
		};

		return <div style={divStyle}>Select element to show in editor</div>;

	}
}

module.exports = SidebarComponent;
