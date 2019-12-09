'use strict';

/**
 * NOTE: Below is deliberately over-exposing modules for now. This is intended for exploring how
 *       Maestro will be used in browser.
 */
const maestro = {

	YAML: require('js-yaml'),

	// models
	Column: require('./app/model/Column'),
	ConcurrentStep: require('./app/model/ConcurrentStep'),
	Duration: require('./app/model/Duration'),
	Procedure: require('./app/model/Procedure'),
	Step: require('./app/model/Step'),
	Task: require('./app/model/Task'),
	TaskRole: require('./app/model/TaskRole'),
	TimeSync: require('./app/model/TimeSync'),
	WebProgram: require('./app/model/WebProgram'),

	// Step Modules
	ApfrInstall: require('./app/step-mods/ApfrInstall'),
	PgtSet: require('./app/step-mods/PgtSet'),
	StepModule: require('./app/step-mods/StepModule'),
	stepModules: require('./app/step-mods/stepModules'),

	// writers
	EvaHtmlProcedureWriter: require('./app/writer/procedure/EvaHtmlProcedureWriter')
};

maestro.app = new maestro.WebProgram();

window.maestro = maestro;
