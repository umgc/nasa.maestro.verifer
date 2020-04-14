import express from 'express';
const app = express();
import router from './index.js';
import nodemon from 'nodemon';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import checkDir from './checkDir.js';
const dirApp = new checkDir();
// import getData from './getData';
// const dataApp = new getData();

const __dirname = path.resolve();
//
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware for form handling
app.use(bodyParser.urlencoded({ extended: false }));

// define initial entries
var entries = [{
	title: 'first',
	content: 'first input'
}];
// make entries used in all views(.ejs)
app.locals.entries = entries;
// make entries used in index.js
app.set('entries', entries);

// projects
const projectsPath = path.join(__dirname, 'projects');
var projects = fs.readdirSync(projectsPath);
// console.log(projects)
app.locals.projects = projects;
app.set('projects', projects);
// dataApp.getProjects

// docx files
var docxs = ['a', 'b'];
app.locals.docxs = docxs;
app.set('docxs', docxs);

// define person
var persons = [];
app.locals.persons = persons;
app.set('persons', persons);

// get html pages from router (index.js)
app.use('/', router);

// 404 Not founded
app.use((request, response)=>{
	response.status(404).render('404');
});

export default app;
