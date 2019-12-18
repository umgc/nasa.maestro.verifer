WIP
===

This file designates the current commit as part of a work-in-progress branch. It will be deleted
prior to incorporating the code into a non-WIP pull request (and certainly before merging into
master).

How to use this WIP
-------------------

```
# in maestro directory
git fetch origin
git checkout react
git pull origin react --ff-only
npm install
npm run build  # or `npm run watch`

# in a maestro project directory
maestro compose --html  # this isn't really necessary anymore, there's just error handling that
                        # requires some HTML file be present in ./build. You can create a blank
                        # ./build/dummy.html if you want.
maestro conduct

# then go to your browser, at the URL specified by `maestro conduct`
```

Stuff to do in this WIP branch
------------------------------

- [x] Get React working in general for web version
- [x] Allow basic modification of individual steps (YAML-editor only)
- [ ] support stepmodules
  - [x] without alterStepReact methods in step modules
  - [ ] with alterStepReact methods
    - [x] PGT
    - [ ] APFR (later so you can have both for testing both cases)
  - [ ] Possibly restructure StepModule `alterStep` methodology
    - [x] Make each step idempotent
    - [x] Make tests pass for apfr.install and pgt.set
    - [ ] Add tests to verify idempotency of TaskWriter.insertStep()
- [x] Fix: editing random step causes step-module steps to duplicate text
- [x] Fix: colors via text like `GREEN` not showing
- [x] Editing via web (in YAML) strips `actor` param from steps if set. Can't set it if not set.
- [ ] Make things like warnings be StepModules?
- [ ] fix numbering (currently starting at 1 for each division, and gets wonky when editing steps)
- [ ] output full yaml of procedure and activities in browser console
- [ ] save yaml to files
- [ ] add --html output type back in its full form for now (for XML output type learning)
- [ ] Make `maestro conduct` not require a dummy html files
- [ ] Fix any broken tests
- [ ] Switch Mocha --> Jest (and maybe Chai --> Jest) for better React and screenshot handling
  - [ ] Use as opportunity to switch to `.test.js` method of keeping tests alongside files
  - [ ] Write tests for React components
  - [ ] Write/alter other tests as required
- [ ] Fix maintainability issues if required (probably required!)
  - [ ] Simplify EvaDivisionWriter
  - [ ] Rename ConcurrentStep to Division? Or Scene? If scene, then series becomes what? Cutaway?

Fixes needed
------------

- [ ] Series key showing as `act0,IV + EV1 + EV2`
  - [ ] Keys in general seem to be in format `act,div,series,step` vs `act-div-series-step`
- [ ] Images still 100x100px

Possible additional things for this WIP branch (but probably in a follow-on)
----------------------------------------------------------------------------

- [ ] Ensure good handling of role variables like `{{role:crewA}}`
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
  - [ ]  'push' button? Or make that part of 'commit'?
