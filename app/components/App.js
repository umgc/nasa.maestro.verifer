/* global maestro */
const React = require('react');
const PropTypes = require('prop-types');
const Header = require('./layout/Header');
const ProcedureViewer = require('./pages/ProcedureViewer');
const ProcedureSelector = require('./pages/ProcedureSelector');
const ReactProcedureWriter = require('../writer/procedure/ReactProcedureWriter');

class App extends React.Component {
	state = {
		procedure: null
	};

	setProcedure = (procObject) => {
		this.setState({
			procedure: procObject,
			procedureWriter: new ReactProcedureWriter(maestro.app, procObject)
		});

		console.log(`Procedure set to ${procObject.name}`);
	};

	getProcedureWriter = () => {
		return this.state.procedureWriter;
	}

	render() {
		return (
			<div className='app'>
				<div className='container'>
					<Header />
					{!this.state.procedure ? (
						<ProcedureSelector
							procedureChoices={window.procedureChoices}
							procedure={this.state.procedure}
							setProcedure={this.setProcedure} />
					) : (
						<ProcedureViewer
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
