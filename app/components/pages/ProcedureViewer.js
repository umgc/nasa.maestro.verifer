const React = require('react');
const PropTypes = require('prop-types');

const Activity = require('../layout/Activity');

class ProcedureViewer extends React.Component {
	render() {

		return this.props.procedure.tasks.map((task, index) => (
			<Activity
				key={task.filename}
				activity={task}
				activityIndex={index}
				procedure={this.props.procedure}
				getProcedureWriter={this.props.getProcedureWriter}
			/>
		));

	}
}

/**
task header

{# Create headers for each column #}
<tr>
	{% for col in columnNames %}
		<th style='width: {{columnWidthPercent}}%;'>{{col}}</th>
	{% endfor %}
</tr>

{# Write a row of the procedure table, aka a "division" #}
<tr>
	{% for col in division %}
		<td{% if col.colspan > 1 %} colspan="{{ col.colspan }}"{% endif %}>{{col.content}}</td>
	{% endfor %}
</tr>

FOR SUMMARY TIMLEINe
<div class="task-block"
     style='height: {{ height }}px;
        background-color: {{ fillColor }};
        font-size: {{ textSize }}px; {% if marginTop %}
        margin-top: {{ marginTop }}px; {% endif %}'>
    <a href="#{{ title | idattr }}">
        <span class='task-title'>{{ title }}</span>
        <span class='task-duration'>({{ duration }})</span>
    </a>
</div>

 */

ProcedureViewer.propTypes = {
	// These don't appear to be able to be marked required since procedure does exist on load.
	// Certainly they are required for actual usage of this component. This is will get fixed when
	// a proper router is used.
	procedure: PropTypes.object,
	getProcedureWriter: PropTypes.func.isRequired
};

module.exports = ProcedureViewer;
