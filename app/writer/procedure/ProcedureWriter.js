'use strict';

const fs = require('fs');
const childProcess = require('child_process');
const clonedeep = require('lodash/cloneDeep');
const Abstract = require('../../helpers/Abstract');

module.exports = class ProcedureWriter extends Abstract {

	constructor(program, procedure) {
		super(['writeFile']);
		this.program = program;

		// clone for gauranteed idempotency, so one Writer can't impact another
		this.procedure = clonedeep(procedure);
	}

	/**
	 * MOVE TO: Program (currently there is no Program.js; "Program" is really
	 * NPM Commander package. Perhaps should have Project.js since procedures
	 * are really documents within a project.)
	 *
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

		if (this.gitHash) {
			return this.gitHash;
		}

		if (fs.existsSync(this.program.gitPath)) {
			try {
				this.gitHash = childProcess
					.execSync(`cd ${this.program.projectPath} && git rev-parse --short HEAD`)
					.toString().trim();
			} catch (err) {
				console.error(err);
			}
		} else {
			this.gitHash = 'NO VERSION (NOT CONFIG CONTROLLED)';
		}

		return this.gitHash;
	}

	getGitUncommittedChanges() {

		if (this.gitUncommittedChanges) {
			return this.gitUncommittedChanges;
		}

		if (fs.existsSync(this.program.gitPath)) {
			try {
				const uncommitted = childProcess
					.execSync(`cd ${this.program.projectPath} && git status --porcelain`)
					.toString().trim().split('\n');

				if (uncommitted.length > 1 || uncommitted[0] !== '') {
					const plural = uncommitted.length === 1 ? '' : 's';
					this.gitUncommittedChanges = `${uncommitted.length} uncommitted change${plural}`;
				} else {
					this.gitUncommittedChanges = false;
				}
			} catch (err) {
				console.error(err);
			}

		} else {
			this.gitUncommittedChanges = false;
		}

		return this.gitUncommittedChanges;
	}

	/**
	 * Get the date of the HEAD commit
	 *
	 * @return {string} Date in iso8601 format
	 */
	getGitDate() {

		if (this.gitDate) {
			return this.gitDate;
		}

		if (fs.existsSync(this.program.gitPath)) {
			try {
				this.gitDate = childProcess
					.execSync(`cd ${this.program.projectPath} && git log -1 --format=%cd --date=iso8601`)
					.toString().trim();
			} catch (err) {
				console.error(err);
			}
		} else {
			this.gitDate = 'NO DATE (NOT CONFIG CONTROLLED)';
		}

		return this.gitDate;
	}

	getLastModifiedBy() {
		return ''; // FIXME: get this from git repo if available
	}

	getTaskDurationDisplay(task) {
		const durationDisplays = [];
		let durationDisplay;

		for (const role of task.rolesArr) {
			durationDisplays.push(role.duration.format('H:M'));
		}

		// if all the duration displays are the same
		if (durationDisplays.every((val, i, arr) => val === arr[0])) {
			durationDisplay = durationDisplays[0];

		// not the same, concatenate them
		} else {
			durationDisplay = durationDisplays.join(' / ');
		}

		return durationDisplay;
	}

	getDocMeta() {
		const docMeta = {
			title: this.procedure.procedure_name,
			lastModifiedBy: this.getLastModifiedBy(),
			creator: this.program.fullName
		};
		if (this.procedure.description) {
			docMeta.description = this.procedure.description; // FIXME: not implemented
		}
		return docMeta;
	}

	renderTasks() {
		for (const task of this.procedure.tasks) {
			this.renderTask(task);
		}
	}

};
