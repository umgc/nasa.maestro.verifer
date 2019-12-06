'use strict';

const maestro = {
	// EvaHtmlProcedureWriter: require('./app/writer/procedure/EvaHtmlProcedureWriter')
};

// const models = [
// 'Column'
// 'ConcurrentStep',
// 'Duration',
// 'Procedure',
// 'Step'
// 'Task',
// 'TaskRole',
// 'TimeSync'
// 'WebProgram'
// ];
// for (const model of models) {
// maestro[model] = require('./app/model/' + model);
// }

// const name = 'Procedure';
// maestro[name] = require(`./app/model/${name}`);

// ! FIXME: the stuff above fails. Webpack doesn't seem to like the template literals in require

// maestro.Procedure = require('./app/model/Procedure'); // fails with ajv (schema validator) error
maestro.Step = require('./app/model/Step');
maestro.Task = require('./app/model/Task');

const stepModules = [
	'ApfrInstall',
	'PgtSet',
	'StepModule',
	'stepModules'
];
for (const stepMod of stepModules) {
	console.log(stepMod);
	maestro[stepMod] = require(`./app/step-mods/${stepMod}`);
}

// maestro.app = new maestro.WebProgram();

// console.log(`${maestro.app.fullName} in browser!`);

window.maestro = maestro;
