const React = require('react');
const PropTypes = require('prop-types');
const uuidv4 = require('uuid/v4');

const Division = require('./Division');

const filters = require('../../helpers/filters');

// const taskStyle = {
// height: {{ height }}px;
// backgroundColor: {{ fillColor }};
// fontSize: {{ textSize }}px; {% if marginTop %}
// marginTop: {{ marginTop }}px; {% endif %}
// }

class Activity extends React.Component {

	// FIXME: largely copied from a procedure writer class, setTaskTableHeader()
	getTableHeaderCells() {

		const columnKeys = this.props.activity.getColumns();
		const columnNames = [];

		for (const colKey of columnKeys) {
			columnNames.push(this.props.procedure.columnToDisplay[colKey]);
		}

		return columnNames.map((name) => (
			<th
				key={filters.uniqueHtmlId('table-header-name')}
				style={{ width: `${100 / columnKeys.length}%` }}>{name}</th>
		));
	}

	render() {

		console.log('move this <Division> back into JSX and troubleshoot');
		// 	<Division
		// 	key={uuidv4()}
		// 	procedure={this.props.procedure}
		// 	activity={this.props.activity}
		// 	division={division}
		// 	getProcedureWriter={this.props.getProcedureWriter}
		// />

		return (
			<React.Fragment>
				<h2
					id={filters.uniqueHtmlId(this.props.activity.title)}
					data-level="procedure"
					data-task={this.props.activity.title}
				>
					{this.props.procedure.name} - {' '}
					{this.props.activity.title} {' '}
					({this.props.getProcedureWriter().getTaskDurationDisplay(this.props.activity)})
				</h2>
				<table className="gridtable">
					<tr>
						{this.getTableHeaderCells()}
					</tr>
					{this.props.activity.concurrentSteps.map((division) => (
						<tr key={uuidv4()}><td>1</td><td>2</td></tr>
					))}
				</table>
			</React.Fragment>
		);
	}

}

Activity.propTypes = {
	procedure: PropTypes.object.isRequired,
	activity: PropTypes.object.isRequired,
	getProcedureWriter: PropTypes.func.isRequired
};

module.exports = Activity;
