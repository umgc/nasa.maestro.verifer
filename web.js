'use strict';

const maestro = {
	// EvaHtmlProcedureWriter: require('./app/writer/procedure/EvaHtmlProcedureWriter')
};

// const models = [
// 'Column',
// 'ConcurrentStep',
// 'Duration',
// 'Procedure',
// 'Step',
// 'Task',
// 'TaskRole',
// 'TimeSync',
// 'WebProgram'
// ];
// for (const model of models) {
// maestro[model] = require('./app/model/' + model);
// }

// const name = 'Procedure';
// maestro[name] = require(`./app/model/${name}`);

// ! FIXME: the stuff above fails. Webpack doesn't seem to like the template literals in require

maestro.Column = require('./app/model/Column');
maestro.ConcurrentStep = require('./app/model/ConcurrentStep');
maestro.Duration = require('./app/model/Duration');
maestro.Procedure = require('./app/model/Procedure');
maestro.Step = require('./app/model/Step');
maestro.Task = require('./app/model/Task');
maestro.TaskRole = require('./app/model/TaskRole');
maestro.TimeSync = require('./app/model/TimeSync');
maestro.WebProgram = require('./app/model/WebProgram');

const stepModules = [
	'ApfrInstall',
	'PgtSet',
	'StepModule',
	'stepModules'
];
for (const stepMod of stepModules) {
	maestro[stepMod] = require(`./app/step-mods/${stepMod}`);
}

// maestro.app = new maestro.WebProgram();

// console.log(`${maestro.app.fullName} in browser!`);

window.maestro = maestro;
