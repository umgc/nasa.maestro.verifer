'use strict';

const arrayHelper = require('../helpers/arrayHelper.js');
const typeHelper = require('../helpers/typeHelper');

let actorToColumn = {};
let columnToDisplay = {};

function remapActorToColumn(columnsHandler) {
	actorToColumn = {};
	for (const col of columnsHandler.columns) {
		for (const actor of col.actors) {
			actorToColumn[actor] = col.key;
		}
	}
}

function remapColumnKeyToDisplay(columnsHandler) {
	columnToDisplay = {};

	for (const col of columnsHandler.columns) {
		if (col.display) {
			columnToDisplay[col.key] = col.display;
		} else {
			columnToDisplay[col.key] = col.key;
		}
	}
}

function doRemapFunctions(columnsHandler) {
	remapActorToColumn(columnsHandler);
	remapColumnKeyToDisplay(columnsHandler);
}

module.exports = class ColumnsHandler {

	constructor(columnsDef) {
		this.columns = [];
		if (columnsDef) {
			this.updateColumns(columnsDef);
		}
	}

	updateColumns(newColumnsDefinition) {
		// if shrinking the number of columns, need to throw out any of the columns beyond the
		// length of newColumnsDefinition. Run Array.pop() for each item to be removed. This, rather
		// than slice, is used so this.columns is not reset and any references are preserved.
		const itemsToRemove = this.columns.length - newColumnsDefinition.length;
		for (let i = 0; i < itemsToRemove; i++) {
			this.columns.pop();
		}

		newColumnsDefinition.forEach((colDef, index) => {
			this.updateColumn(index, colDef, false);
		});

		doRemapFunctions(this);
	}

	updateColumn(index, colDef, doRemaps = true) {

		if (!this.columns[index] || typeof this.columns[index] !== 'object') {
			this.columns[index] = {};
		}

		typeHelper.errorIfIsnt(colDef, 'object');
		typeHelper.errorIfIsnt(colDef.key, 'string');
		typeHelper.errorIfIsnt(colDef.actors, 'string', 'array');
		typeHelper.errorIfIsnt(colDef.display, 'falsy', 'string');

		this.columns[index].key = colDef.key;
		this.columns[index].actors = arrayHelper.parseArray(colDef.actors);
		this.columns[index].display = colDef.display ? colDef.display : colDef.key;

		if (doRemaps) {
			doRemapFunctions(this);
		}
	}

	getDefinition() {
		const columnsDefinition = [];
		this.columns.forEach(function(col, i) {
			columnsDefinition[i] = {};
			columnsDefinition[i].key = col.key;
			columnsDefinition[i].actors = col.actors;

			// if display wasn't set in the initial definition, and this function is used to modify
			// the definition, this will set the display to the value of the key.
			columnsDefinition[i].display = col.display;
		});
		return columnsDefinition;
	}

	/**
	 * Map actor key to column key. Both strings. Variable actorToColumn is in form:
	 *   {
	 *     "*": "IV",
	 *     "EV1": "EV1",
	 *     "EV2": "EV2"
	 *   }
	 * A more complicated form may be:
	 *   {
	 *     "*": "IV",
	 *     "EV1": "EV1",
	 *     "ROBO": "EV1"
	 *   }
	 * In this second example the "ROBO" actor gets mapped to the EV1 column.
	 *
	 * @param  {string} actor   key for actor
	 * @return {string}         key of column (key of primary actor of column)
	 */
	getActorColumnKey(actor) {
		if (actorToColumn[actor]) {
			return actorToColumn[actor];
		} else if (actorToColumn['*']) {
			return actorToColumn['*']; // wildcard for all others
		} else {
			throw new Error(
				`Unknown column for actor ${actor}. Consider adding wildcard * actor to a column`
			);
		}
	}

	getActorColumnIndex(actor) {
		const colKey = this.getActorColumnKey(actor);
		return this.getColumnKeyIndex(colKey);
	}

	// check for usage FIXME

	getColumnKeys() {
		return this.columns.map((col) => col.key);
	}

	getColumnKeyIndex(key) { // was getColumnIndex
		for (let c = 0; c < this.columns.length; c++) {
			if (this.columns[c].key === key) {
				return c;
			}
		}
		throw new Error(`key ${key} not found in columns`);
	}

	getColumnDisplayTextByActor(actor) {
		const colIndex = this.getActorColumnIndex(actor);
		return this.columns[colIndex].display.slice();
	}

	getDisplayTextFromColumnKey(colKey) {
		return columnToDisplay[colKey];
	}

};
