Roadmap
=======

Maestro is under heavy development, with many critical pieces not started yet. As such, it is easier
to maintain the work being done in this document versus opening issues on GitHub for each change.

Up next
-------

- [x] output full yaml of procedure and activities in browser console
- [x] show diff of what changed on each step save in console (later maybe show in UI)
- [ ] save yaml to files

Fixes needed
------------

- [ ] Images still 100x100px

Future features list
--------------------

- [ ] Make things like warnings be StepModules?
- [ ] Add APFR alterStepReact() method after determining way to test fallback methods
- [ ] Add error handling for bad user inputs for edits
- [ ] Add ability to add and delete steps
- [ ] Add ability to reorder steps
  - [ ] within current series (cell)
  - [ ] into other series/divisions (columns/rows)
- [ ] Add/delete division (row)
- [ ] Add steps for a role not currently present in an activity
  - [ ] (i.e. generate an EV2 column when it doesn't exist yet)
- [ ] Merge columns (create joint actor/role steps, e.g. `crewA + crewB`)
- [ ] Add summary timeline to output
- [ ] Edit summary timeline
  - [ ] Click on activity to edit details (durations, title, etc)
  - [ ] Reorder activity (move up/down for a given actor, not drag-drop yet)
  - [ ] Delete activity
  - [ ] Add new activity
- [ ] Add git functions (that would be super-insecure in a public server):
  - [ ] 'view diff' button that runs `git diff` on the "server" and displays as a modal in the site
  - [ ] 'commit' button that gives a summary input box, then runs `git add . && git commit ...`
    - [ ] Force commit to branch? Maybe use your email as branch name?
  - [ ] 'push' button? Or make that part of 'commit'?
- [ ] Switch Mocha --> Jest (and maybe Chai --> Jest)? Some indications it may be better for React
- [ ] Fix maintainability issues (perpetual)
- [ ] Simplify and really well document EvaDivisionWriter
- [ ] Rename ConcurrentStep to Division? Or Scene? If scene, then series becomes what? Cutaway?


Completed work
--------------

### On `react` branch PR #99

- [x] Get React working in general for web version
- [x] Allow basic modification of individual steps (YAML-editor only)
- [ ] support stepmodules
  - [x] without alterStepReact methods in step modules
  - [x] with alterStepReact methods
    - [x] PGT (postponed creating for APFR to allow testing fallback method)
  - [x] Possibly restructure StepModule `alterStep` methodology
    - [x] Make each step idempotent
    - [x] Make tests pass for apfr.install and pgt.set
    - [x] Add tests to verify idempotency of TaskWriter.insertStep()
- [x] Fix: editing random step causes step-module steps to duplicate text
- [x] Fix: colors via text like `GREEN` not showing
- [x] Editing via web (in YAML) strips `actor` param from steps if set. Can't set it if not set.
- [x] Fix any broken tests
- [x] add --html output type back in its full form for now (for XML output type learning)
- [x] Ensure good handling of role variables like `{{role:crewA}}`
- [x] Make `maestro conduct` not require a dummy html files
- [x] Testing
  - [x] Modify mocha/babel/etc to make it possible to run React test
  - [x] Use as opportunity to switch to `.spec.js` method of keeping tests alongside files
  - [x] Write tests for at least some React components
  - [x] Write/alter other tests as required
- [x] fix numbering (currently starting at 1 for each division, and gets wonky when editing steps)
- [x] Make `maestro conduct` move images into build dir, or access images dir directly
- [x] Call all React classes `ThingComponent` rather than `Thing` to distinguish from models
- [x] Fix keys showing as `act,div,series,step` vs `act-div-series-step`
