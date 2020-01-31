const React = require('react');
const PropTypes = require('prop-types');
// const { render } = require('react-dom');
const { Form } = require('react-final-form');
const arrayMutators = require('final-form-arrays').default;
const { FieldArray } = require('react-final-form-arrays');

const stateHandler = require('../../state/index');

const { validators, textInputField, durationInput, selectInputField } = require('./formInputTypes');
const { isZeroish, minLength, isRGBstring, required } = validators;

// validate={insertFunction}
const validateForm = (values) => {
	const errors = {};

	const roleIndexes = {};
	const actorIndexes = {};
	values.roles.forEach((role, index) => {

		if (!role) {
			if (!errors.roles) {
				errors.roles = [];
			}
			errors.roles[index] = {};
			return;
		}

		// Setup for unique role validation below
		if (!roleIndexes[role.name]) {
			roleIndexes[role.name] = [];
		}
		roleIndexes[role.name].push(index);

		// Setup for unique actor validation below
		if (!actorIndexes[role.playedBy]) {
			actorIndexes[role.playedBy] = [];
		}
		actorIndexes[role.playedBy].push(index);

		// validate duration
		if (isZeroish(role.duration ? role.duration.hours : 0) &&
			isZeroish(role.duration ? role.duration.minutes : 0)) {
			if (!errors.roles) {
				errors.roles = [];
			}
			errors.roles[index] = { duration: {} };
			errors.roles[index].duration.minutes = 'Duration must be greater than 0';
		}
	});

	for (const role in roleIndexes) {
		if (roleIndexes[role].length > 1) {
			if (!errors.roles) {
				errors.roles = [];
			}
			for (const badIndex of roleIndexes[role]) {
				if (!errors.roles[badIndex]) {
					errors.roles[badIndex] = {};
				}
				errors.roles[badIndex].name = 'Duplicate role name found';
			}
		}
	}

	for (const actor in actorIndexes) {
		if (actorIndexes[actor].length > 1) {
			if (!errors.roles) {
				errors.roles = [];
			}
			for (const badIndex of actorIndexes[actor]) {
				if (!errors.roles[badIndex]) {
					errors.roles[badIndex] = {};
				}
				errors.roles[badIndex].playedBy = 'Duplicate actor found';
			}
		}
	}

	return errors;
};

const DivisionMetaForm = ({ division, editorOptions }) => {

	/*
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
		console.log('Activity form submit', JSON.stringify(values, 0, 2));

		const updateValues = function(v) {
			values = v;
		};

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

		const postFileChange = function() {
			// this must precede Task.setState() due to running Task.setRoles() internally
			// FIXME is ^ still true?
			task.updateTaskRequirements({
				file: values.file,
				color: values.color,
				roles: roleReqs
			});
			stateHandler.saveProcedureChange();

			task.setState(values);

			// FIXME setState should run this now
			// stateHandler.state.procedure.setupTimeSync();

			stateHandler.saveChange(
				stateHandler.state.procedure.TasksHandler.getTaskIndexByUuid(task.uuid)
			);
		};

		if (values.title !== task.title) {
			const newFilename = task.formatTitleToFilename(values.title);
			console.log('new file name ------------------', newFilename);

			// FIXME doesn't really belong in stateHandler
			stateHandler.moveFile(task, newFilename, function(response) {
				if (response.success) {
					console.log('File moved successfully', response);

					// since file move was successful, now adjust file in state
					values.file = newFilename;
					updateValues(values);
				} else {
					console.error('Failed to move file', response);
				}
				postFileChange();
			});
		} else {
			postFileChange();
		}

	};
	*/

	const handleCloseEditorClick = () => {
		stateHandler.unsetEditorNode();
	};

	const handleDeleteClick = () => {
		console.log(`clicked "delete division" for ${division.uuid}`);
		const activityIndex = stateHandler.state.procedure.TasksHandler
			.getTaskIndexByUuid(editorOptions.activityUuid);
		const activity = stateHandler.state.procedure.tasks[activityIndex];

		const divisionIndex = activity.getDivisionIndexByUuid(division.uuid);
		activity.deleteDivision(divisionIndex);

		stateHandler.saveChange(activityIndex);
		stateHandler.unsetEditorNode();
	};

	// FIXME either use this to highlight the current division being edited, or delete this.
	// React.useEffect(() => {
	// /**
	//  *
	// */
	// function cleanup() {
	// const currentSelected = document.getElementsByClassName('timeline-selected');
	// for (const block of currentSelected) {
	// block.classList.remove('timeline-selected');
	// }
	// }
	// cleanup();
	// const blocks = document.getElementsByClassName(`block-${task.uuid}`);
	// for (const block of blocks) {
	// block.classList.add('timeline-selected');
	// }
	// return cleanup;
	// });

	const mergeCheckboxes = () => {
		const actors = Object.keys(division.subscenes);
		const columnsFromTask = task.getColumns();
		return <div>
			<h5>Merge columns</h5>
			{actors.map((actor) => {

			})}
		</div>

		for (const actor in division.subscenes) {

		}
	};

	return (
		<div>
			<h3>Edit Sync Block
				<button onClick={handleCloseEditorClick}>close editor</button>
				<button onClick={handleDeleteClick}>delete</button>
			</h3>

		</div>
	);

};

DivisionMetaForm.propTypes = {
	division: PropTypes.object.isRequired,
	editorOptions: PropTypes.object.isRequired
};

module.exports = DivisionMetaForm;
