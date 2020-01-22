'use strict';

const TaskRole = require('../../app/model/TaskRole');

/**
 * Returns an object with one key: the value supplied in `roleName`. The value associated with that
 * key is a TaskRole object constructed with fictitious task and role requirements.
 *
 * @param {string} roleName
 * @param {string} actorName
 * @return {Object}           Returns object like { someRoleText: TaskRole }
 */
function getSingle(roleName = 'crewX', actorName = 'EV7') {
	const roleDef = {
		name: roleName,
		description: 'Person who does XYZ',
		duration: Object.create({ minutes: 20 })
	};
	const taskRequirements = {
		file: 'foo-task.yml',
		roles: {},
		color: '#7FB3D5'
	};
	taskRequirements.roles[roleName] = actorName;
	const taskRole = new TaskRole(
		Object.create(roleDef),
		Object.create(taskRequirements)
	);
	const out = {};
	out[roleName] = taskRole;
	return out;
}

/**
 * Perform getSingle() multiple times for each key-value pair in `roleToActorMap`
 *
 * @param {Object} roleToActorMap  Like: { roleA: actorA, roleB: actorB }
 * @return {Object}                Like: { roleA: new TaskRole(...), roleB: new TaskRole(...) }
 */
function getMultiple(roleToActorMap) {
	const taskRoles = {};
	for (const role in roleToActorMap) {
		const actor = roleToActorMap[role];
		const single = getSingle(role, actor);
		taskRoles[role] = single[role];
	}
	return taskRoles;
}

module.exports = {
	getSingleTaskRole: getSingle,
	getDoubleTaskRole: getMultiple
};
