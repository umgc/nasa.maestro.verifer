'use strict';

const fs = require('fs');
const childProcess = require('child_process');

const packageJson = require('../../package.json');
const envHelper = require('../helpers/envHelper');

const noGitMessage = 'Git not available in browser';

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

		if (this.gitHash) {
			return this.gitHash;
		}

		if (envHelper.isBrowser) {
			this.gitHash = noGitMessage;
			return this.gitHash;
		}

		if (fs.existsSync(this.gitPath)) {
			try {
				this.gitHash = childProcess
					.execSync(`cd ${this.projectPath} && git rev-parse --short HEAD`)
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

		if (envHelper.isBrowser) {
			this.gitUncommittedChanges = noGitMessage;
			return this.gitUncommittedChanges;
		}

		if (fs.existsSync(this.gitPath)) {
			try {
				const uncommitted = childProcess
					.execSync(`cd ${this.projectPath} && git status --porcelain`)
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

		if (envHelper.isBrowser) {
			this.gitDate = noGitMessage;
			return this.gitDate;
		}

		if (fs.existsSync(this.gitPath)) {
			try {
				this.gitDate = childProcess
					.execSync(`cd ${this.projectPath} && git log -1 --format=%cd --date=iso8601`)
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

};
