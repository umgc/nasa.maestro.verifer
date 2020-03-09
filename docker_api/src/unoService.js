'use strict';

import { spawn } from 'child_process';

export default class UnoService {
	/**
    * Start a listener.
    *
    * @param {Object} options
    * @return {ChildProcess}
    * @api public
    */
	listen(options) {
		var self = this,
			args,
			bin = 'unoconv';

		args = ['--listener'];

		if (options && options.port) {
			args.push('-p' + options.port);
		}

		if (options && options.bin) {
			bin = options.bin;
		}

		console.log('UnoService is listening', self);
		return spawn(bin, args);
	}

}
