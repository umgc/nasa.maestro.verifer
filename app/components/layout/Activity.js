const React = require('react');
const PropTypes = require('prop-types');

const Division = require('./Division');

const filters = require('../../helpers/filters');
const maestroKey = require('../helpers/maestroKey');

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
				key={filters.uniqueHtmlId(`table-header-${name}`)}
				style={{ width: `${100 / columnKeys.length}%` }}>{name}</th>
		));
	}

	render() {

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
					<thead>
						<tr>
							{this.getTableHeaderCells()}
						</tr>
					</thead>
					<tbody>
						{this.props.activity.concurrentSteps.map((division, index) => {
							return (
								<Division
									key={maestroKey.getKey(this.props.activityIndex, index)}
									procedure={this.props.procedure}
									activity={this.props.activity}
									activityIndex={this.props.activityIndex}
									division={division}
									divisionIndex={index}
									getProcedureWriter={this.props.getProcedureWriter}
								/>
							);
						})}
					</tbody>
				</table>
			</React.Fragment>
		);
	}

}

Activity.propTypes = {
	procedure: PropTypes.object.isRequired,
	activity: PropTypes.object.isRequired,
	getProcedureWriter: PropTypes.func.isRequired,
	activityIndex: PropTypes.number.isRequired
};

module.exports = Activity;
