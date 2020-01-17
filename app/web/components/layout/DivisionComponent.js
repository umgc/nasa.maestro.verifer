const React = require('react');
const PropTypes = require('prop-types');
const ReactTaskWriter = require('../../../writer/task/ReactTaskWriter');

class DivisionComponent extends React.Component {

	constructor(props) {
		super(props);
		this.taskWriter = new ReactTaskWriter(this.props.activity, this.props.getProcedureWriter());
	}

	render() {
		return this.taskWriter.writeDivision(
			this.props.division,
			this.props.activityIndex,
			this.props.divisionIndex
		);
	}

}

DivisionComponent.propTypes = {
	procedure: PropTypes.object.isRequired,
	activity: PropTypes.object.isRequired,
	division: PropTypes.object.isRequired,
	getProcedureWriter: PropTypes.func.isRequired,
	activityIndex: PropTypes.number.isRequired,
	divisionIndex: PropTypes.number.isRequired
};

module.exports = DivisionComponent;
