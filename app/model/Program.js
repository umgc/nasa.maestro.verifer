'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const packageJson = require('../../package.json');
const envHelper = require('../helpers/envHelper');
const consoleHelper = require('../helpers/consoleHelper');

const noGitMessage = 'Git not available in browser';

function runGitCmd(projectPath, cmd) {
	let output;

	try {
		output = childProcess
			.execSync(`cd ${projectPath} && ${cmd}`)
			.toString()
			.trim();
	} catch (err) {
		console.error(err);
	}

	return output;
}

function getDateOrHash(program, type) {

	const types = {
		hash: {
			prop: 'gitHash',
			cmd: 'git rev-parse --short HEAD',
			noRepoText: 'NO VERSION (NOT CONFIG CONTROLLED)'
		},
		date: {
			prop: 'gitDate',
			cmd: 'git log -1 --format=%cd --date=iso8601',
			noRepoText: 'NO DATE (NOT CONFIG CONTROLLED)'
		}
	};
	const prop = types[type].prop;

	if (program[prop]) {
		return program[prop];
	}

	if (envHelper.isBrowser) {
		program[prop] = noGitMessage;
		return program[prop];
	}

	program[prop] = fs.existsSync(program.gitPath) ?
		runGitCmd(program.projectPath, types[type].cmd) :
		types[type].noRepoText;

	return program[prop];
}

module.exports = class Program {

	constructor() {
		this.name = 'Maestro';
		this.version = packageJson.version;
		this.fullName = `${this.name} v${this.version}`;
		this.repoURL = packageJson.repository.url;
		this.description = packageJson.description;
	}

	/**
	 * OPTIMIZE: Instead of using child_process, dig into .git directory. Or use
	 * an npm package for dealing with git.
	 *
	 * ADD FEATURE: Consider `git describe --tags` if tags are available. That
	 * will be easier for people to understand if a version they are looking at
	 * is significantly different. Something like semver. If version is = X.Y.Z,
	 * then maybe version changes could be:
	 *
	 *    Changes to X = Adding/removing significant tasks from a procedure
	 *    Changes to Y = ??? Adding/removing/modifying steps or adding/removing
	 *                   insignificant tasks.
	 *    Changes to Z = Fixes and minor clarifications. Changes should not
	 *                   affect what crew actually do.
	 *
	 * @return {string} First 8 characters of git hash for project
	 */
	getGitHash() {
		return getDateOrHash(this, 'hash');
	}

	/**
	 * @return {string|boolean}  False if no uncommitted changes. "X uncommitted change(s)" if any.
	 */
	getGitUncommittedChanges() {

		if (this.gitUncommittedChanges) {
			return this.gitUncommittedChanges;
		}

		if (envHelper.isBrowser) {
			this.gitUncommittedChanges = noGitMessage;
			return this.gitUncommittedChanges;
		}

		this.gitUncommittedChanges = false;

		if (fs.existsSync(this.gitPath)) {
			const uncommitted = runGitCmd(this.projectPath, 'git status --porcelain').split('\n');
			if (uncommitted.length > 1 || uncommitted[0] !== '') {
				const plural = uncommitted.length === 1 ? '' : 's';
				this.gitUncommittedChanges = `${uncommitted.length} uncommitted change${plural}`;
			}
		}

		return this.gitUncommittedChanges;
	}

	/**
	 * Get the date of the HEAD commit
	 *
	 * @return {string} Date in iso8601 format
	 */
	getGitDate() {
		return getDateOrHash(this, 'date');
	}

	/**
	 * Currently returns empty string. Someday actually get user info from git repo.
	 * @return {string}  Currently just returns ''. Someday return 'User Name<user.name@example.com'
	 */
	getLastModifiedBy() {
		return '';
	}

	/**
	 * Get the path to an HTML file for a Maestro project. If multiple HTML files found, this will
	 * lazily just pick one.
	 *
	 * @todo Add optional param to specify a single file or regex match certain files.
	 *
	 * @return {string}  Path to HTML file
	 */
	getProjectHtmlFile() {
		const htmlFiles = fs.readdirSync(this.outputPath).filter((filename) => {
			return filename.endsWith('.html');
		});

		if (htmlFiles.length > 1) {
			consoleHelper.warn(`Multiple HTML files found in /build directory\nBeing lazy and using first one: ${htmlFiles[0]}`);
		} else if (htmlFiles.length === 0) {
			return false;
		}
		const htmlFile = path.join(this.outputPath, htmlFiles[0]);
		return htmlFile;
	}

};
