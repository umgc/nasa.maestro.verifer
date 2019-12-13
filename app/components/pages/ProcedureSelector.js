/* global maestro */
const React = require('react');
const PropTypes = require('prop-types');

const btnStyle = {
	padding: '5px 9px',
	cursor: 'pointer'
};

class ProcedureSelector extends React.Component {

	onClick = (proc) => {
		maestro.app.loadProcedure(proc)
			.then(() => {
				this.props.setProcedure(maestro.app.procedure);
			});
	};

	render() {
		return this.props.procedureChoices.map((proc) => (
			<button
				key={proc}
				onClick={this.onClick.bind(this, proc)}
				style={btnStyle}
			>
				{proc}
			</button>
		));
	}
}

ProcedureSelector.propTypes = {
	procedure: PropTypes.object,
	procedureChoices: PropTypes.array.isRequired,
	setProcedure: PropTypes.func.isRequired
};

module.exports = ProcedureSelector;
