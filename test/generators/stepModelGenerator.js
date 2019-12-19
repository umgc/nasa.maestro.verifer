'use strict';

const Step = require('../../app/model/Step');
const taskRoleGenerator = require('./taskRoleGenerator');

/**
 *
 * @param {Object|string} stepDefinition  Either a string like "Do some stuff" or an object like:
 *                                        {
 *                                          step: "Do some stuff",
 *                                          title: "Time to do some stuff"
 *                                          duration: ..., checkboxes: ..., images: ...,
 *                                        }
 * @param {string}        roleName        Like "crewA" or "ssrmsCrew" or whatever to call the role.
 * @param {string}        actorName       Like "EV1" or "EV2". The actor passed into the role.
 * @return {Step}
 */
function stepModelGenerator(stepDefinition, roleName, actorName) {

	const taskRoles = taskRoleGenerator.getSingleTaskRole(roleName, actorName);
	const step = new Step(stepDefinition, actorName, taskRoles);

	return step;
}

module.exports = stepModelGenerator;
