const React = require('react');
const PropTypes = require('prop-types');
const { render } = require('react-dom');
const { Form, Field } = require('react-final-form');
const arrayMutators = require('final-form-arrays').default;
const { FieldArray } = require('react-final-form-arrays');

const stateHandler = require('../../state/index');
const Duration = require('../../../model/Duration');

// Validation here: https://codesandbox.io/s/wy7z7q5zx5
// const required = (value) => (value ? undefined : 'Required');
// const mustBeNumber = (value) => (isNaN(value) ? 'Must be a number' : undefined);
// const minValue = (min) => (value) =>
// 	isNaN(value) || value >= min ? undefined : `Should be greater than ${min}`;
// const composeValidators = (...validators) => (value) =>
// 	validators.reduce((error, validator) => error || validator(value), undefined);

// const formatDurationInput(durationInput) = function() {
// 	const timeTypes = ['hours', 'minutes', 'seconds'];
// };

const ActivityMetaForm = ({ task }) => {
	const taskDef = task.getDefinition();
	const initial = {
		title: taskDef.task.title,
		file: taskDef.requirements.file,
		color: taskDef.requirements.color,
		roles: taskDef.task.roles
	};
	for (const role of initial.roles) {
		role.playedBy = taskDef.requirements.roles[role.name];
	}

	const onSubmit = (values) => {
		console.log(JSON.stringify(values, 0, 2));
		const roleReqs = {};
		for (const role of values.roles) {
			if (!role.playedBy) {
				console.log('no actor in role.playedBy', role);
				console.log('should be:', task.rolesDict[role.name].actor);
			}
			roleReqs[role.name] = role.playedBy;
			// task.setDurationForRole(role.playedBy, new Duration(role.duration));
			// delete role.playedBy;
		}

		// this must precede updateRoleDefinitions
		task.updateTaskRequirements({
			file: values.file,
			color: values.color,
			roles: roleReqs
		});
		stateHandler.saveProcedureChange();

		task.setTitle(values.title);
		task.updateRolesDefinitions(values.roles, false);
		stateHandler.state.procedure.setupTimeSync();

		stateHandler.saveChange(
			stateHandler.state.procedure.TasksHandler.getTaskIndexByUuid(task.uuid)
		);

	};

	const handleDeleteClick = (event) => {
		console.log(`clicked "delete" for timeline activity ${event.target.dataset.uuid}`);
		const taskIndex = stateHandler.state.procedure.TasksHandler
			.getTaskIndexByUuid(task.uuid);
		stateHandler.state.procedure.TasksHandler.deleteTask(taskIndex);
		stateHandler.saveProcedureChange();
		stateHandler.setEditorNode(null);
	};

	return (
		<div>
			<h3>Edit Activity <button onClick={handleDeleteClick}>delete activity</button></h3>
			<Form
				onSubmit={onSubmit}
				mutators={{
					...arrayMutators
				}}
				initialValues={initial}
				render={({
					handleSubmit,
					form: {
						mutators: { push, pop }
					}, // injected from final-form-arrays above
					pristine,
					form,
					submitting,
					values
				}) => {
					return (
						<form onSubmit={handleSubmit}>
							<div>
								<label>Title</label>
								<Field name="title" component="input" />
							</div>
							<div>
								<label>File name</label>
								<Field name="file" component="input" />
							</div>
							<div>
								<label>Color</label>
								<Field name="color" component="input" />
							</div>
							<h4>
							Roles
								<button
									type="button"
									onClick={() => push('roles', undefined)}
								>
								Add Role
								</button>
							</h4>
							<FieldArray name="roles">
								{({ fields }) =>
									fields.map((name, index) => (
										<div style={{ backgroundColor: 'white', margin: '5px', padding: '5px' }} key={name}>
											<div><label>Role #{index + 1}</label></div>
											<div>
												<label>Role:</label>
												<Field
													name={`${name}.name`}
													component="input"
													placeholder="Role name (e.g. 'crewA', 'ssrmsCrew')"
												/>
											</div>
											<div>
												<label>Actor in role:</label>
												<Field
													name={`${name}.playedBy`}
													component="input"
													placeholder="Actor filling role (e.g. 'EV1')"
												/>
											</div>
											<div>
												<label>Duration:</label>
												<Field
													name={`${name}.duration.hours`}
													component="input"
													placeholder="0"
													style={{ width: '50px' }}
												/>
											:
												<Field
													name={`${name}.duration.minutes`}
													component="input"
													placeholder="0"
													style={{ width: '50px' }}
												/>
											</div>
											<div>
												<label>Offset start time:</label>
												<Field
													name={`${name}.duration.offset.hours`}
													component="input"
													placeholder="0"
													style={{ width: '50px' }}
												/>
											:
												<Field
													name={`${name}.duration.offset.minutes`}
													component="input"
													placeholder="0"
													style={{ width: '50px' }}
												/>
											</div>
											<div>
												<label>Description:</label>
												<Field
													name={`${name}.description`}
													component="input"
													placeholder="Description of role"
												/>
											</div>
											<div style={{ textAlign: 'right' }}>
												<span
													onClick={() => fields.remove(index)}
													style={{ cursor: 'pointer' }}
												>
											❌ Remove role
												</span>
											</div>
										</div>
									))
								}
							</FieldArray>

							<div className="buttons">
								<button type="submit" disabled={submitting || pristine}>
								Save
								</button>
								<button
									type="button"
									onClick={form.reset}
									disabled={submitting || pristine}
								>
								Reset
								</button>
							</div>
							{/* <h4>Raw data</h4>
							<pre>{JSON.stringify(values, 0, 2)}</pre> */}
						</form>
					);
				}}
			/>
		</div>
	);
};

ActivityMetaForm.propTypes = {
	task: PropTypes.object.isRequired
};

module.exports = ActivityMetaForm;
