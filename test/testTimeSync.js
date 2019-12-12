/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const path = require('path');
const assert = require('chai').assert;

const Procedure = require('../app/model/Procedure');
const TimeSync = require('../app/model/TimeSync');

const expectedComplexToString = `Double 0
  EV1: 00:17 + 00:29 = 00:46
  EV2: 00:00 + 00:47 = 00:47
Single 0
  EV1: 00:46 + 00:01 = 00:47
Single 1
  EV1: 00:47 + 00:07 = 00:54
Single 2
  EV2: 00:47 + 00:11 = 00:58
Single 3
  EV2: 00:58 + 00:13 = 01:11
Double 1
  EV3: 00:31 + 00:29 = 01:00
  EV4: 00:00 + 00:59 = 00:59
Double 2
  EV3: 01:00 + 01:01 = 02:01
  EV1: 00:57 + 01:07 = 02:04
Single 4
  EV4: 00:59 + 00:23 = 01:22
Single 5
  EV4: 01:22 + 01:01 = 02:23
Triple 0
  EV3: 02:08 + 00:23 = 02:31
  EV1: 02:04 + 00:53 = 02:57
  EV2: 02:01 + 00:37 = 02:38
Triple 1
  EV2: 03:04 + 00:23 = 03:27
  EV3: 03:00 + 00:53 = 03:53
  EV1: 02:57 + 00:37 = 03:34
Double 3
  EV1: 03:52 + 00:47 = 04:39
  EV3: 03:53 + 00:43 = 04:36
Double 4
  EV3: 04:52 + 01:11 = 06:03
  EV1: 04:39 + 00:47 = 05:26
Single 6
  EV3: 06:03 + 01:07 = 07:10
Single 7
  EV1: 05:26 + 01:11 = 06:37
Single 8
  EV2: 03:27 + 01:19 = 04:46
Single 9
  EV2: 04:46 + 01:29 = 06:15
Double 5
  EV2: 06:56 + 00:17 = 07:13
  EV1: 06:37 + 00:41 = 07:18
`;

describe('TimeSync', function() {
	const baseProcedure = new Procedure();
	const procedureFilePath = path.join(__dirname, 'cases/complex-times/procedures/proc.yml');

	const err = baseProcedure.addProcedureDefinitionFromFile(procedureFilePath);
	if (err) {
		throw new Error(err);
	}

	const baseTimeSync = new TimeSync(baseProcedure.tasks);
	baseTimeSync.sync();
	const baseToString = baseTimeSync.toString();

	describe('updateStartTimes()', function() {
		for (let t = 0; t < baseProcedure.tasks.length; t++) {
			const testProcedure = new Procedure();
			const err = testProcedure.addProcedureDefinitionFromFile(procedureFilePath);
			if (err) {
				throw new Error(err);
			}
			// todo setup a mock for console.log so `beVerbose` can be set to true
			const testTimeSync = new TimeSync(
				testProcedure.tasks,
				false,
				false // <-- don't do initial updateStartTimes
			);

			// Start updateStartTimes() at task[t] to verify is independent of initial task
			testTimeSync.updateStartTimes(testProcedure.tasks[t]);

			testTimeSync.sync();
			const testToString = testTimeSync.toString();
			it(`should have the same output when sync() started at task #${t}`, function() {
				assert.equal(testToString, baseToString);
			});
		}
	});

	describe('sync()', function() {
		for (let t = 0; t < baseProcedure.tasks.length; t++) {
			const testProcedure = new Procedure();
			const err = testProcedure.addProcedureDefinitionFromFile(procedureFilePath);
			if (err) {
				throw new Error(err);
			}
			const testTimeSync = new TimeSync(testProcedure.tasks);

			// Start sync() at task[t] to verify is independent of initial task
			testTimeSync.sync(testProcedure.tasks[t]);

			const testToString = testTimeSync.toString();
			it(`should have the same output when sync() started at task #${t}`, function() {
				assert.equal(testToString, baseToString);
			});
		}
	});

	describe('toString()', function() {
		it('should have standard output', function() {
			assert.equal(baseToString, expectedComplexToString);
		});
	});

	describe('endpoints()', function() {
		it('should correctly identify endpoints', function() {
			const expectedEndpoints = {
				EV1: { first: baseProcedure.tasks[0], last: baseProcedure.tasks[17] },
				EV2: { first: baseProcedure.tasks[0], last: baseProcedure.tasks[17] },
				EV3: { first: baseProcedure.tasks[5], last: baseProcedure.tasks[13] },
				EV4: { first: baseProcedure.tasks[5], last: baseProcedure.tasks[8] }
			};
			assert.deepEqual(baseTimeSync.endpoints(), expectedEndpoints);
		});
	});

});
