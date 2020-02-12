const React = require('react');
const PropTypes = require('prop-types');
const exitCodes = require('../../../helpers/exitCodes');

// FIXME cleansup all theses
// const CommanderProgram = require('../../../model/CommanderProgram');
// const Procedure = require('../../../model/Procedure');
// const Program = require('../../../model/Program');
// const EvaDocxProcedureWriter = require('../../../writer/procedure/EvaDocxProcedureWriter');
const stateHandler = require('../../state/index');

class ExportToWordButton extends React.Component {

	constructor(props) {
		super(props);
		this.state = { exportStatus: 'NO_PROCEDURE' };
	}

	exportSuccess = () => {
		this.setState({ exportStatus: 'EXPORT_SUCCESS' });
		setTimeout(
			() => {
				this.setState({ exportStatus: 'READY' });
			},
			5000
		);
	}

	exportFailure = (error, stdout, stderr) => {
		const errorTextCode = error && error.code && exitCodes.numberToMessage[error.code] ?
			exitCodes.numberToMessage[error.code] : undefined;

		if (errorTextCode) {
			console.error(`Error text code: ${errorTextCode}`);
		}
		console.error({ error, stdout, stderr });

		if (errorTextCode === 'EBUSY') {
			this.setState({ exportStatus: 'EXPORT_ERROR_FILE_OPEN' });
		} else {
			this.setState({ exportStatus: 'EXPORT_ERROR' });
		}

		setTimeout(
			() => {
				this.setState({ exportStatus: 'READY' });
			},
			5000
		);
	}

	exportToWord = () => {
		console.log('Beginning Export to word');
		this.setState({ exportStatus: 'EXPORTING' });
		window.maestro.exportToWord(
			`${stateHandler.state.procedure.filename}.docx`,
			this.exportSuccess,
			this.exportFailure
		);

		/**
		 * FIXME: The function above uses child_process to call maestro on the command line. This
		 * will only work if the system has Node installed (and accessible in PATH at `node`, which
		 * may not be the case for systems like Debian). This is highly undesirable, since one of
		 * the points of Electron is to package everything up and not have dependencies. Using this
		 * method was done after a day of unsuccessful efforts, such that a MVP editor can be
		 * released ASAP.
		 *
		 * The level of difficulty with this functionality was unexpected since it seemed like
		 * calling the same Node modules used by the Maestro CLI should work from Elelctron.
		 * However, there were several issues. This is my best effort to recollect everything:
		 *
		 *   1. Using the prior methods of generating Summary Timeline images did not work in the
		 *      Electron/browser context, since some of the required modules were compiled modules,
		 *      and were compiled for my local version of Node, not for the version used by
		 *      Electron. This was mostly worked around by PR #124 (commit 114918f5)
		 *   2. After (1) was resolved, an issue with the PgtSet StepModule was found. Any procedure
		 *      without a `pgt.set` in it rendered without issue in the browser context. If pgt.set
		 *      was present, however, the resulting Word document was corrupted. Ref issue #126.
		 *   3. Other things were tried but I'm forgetting at this point.
		 */

	}

	render() {
		if (!this.props.procedureFile) {
			return null;
		}
		let element;
		switch (this.state.exportStatus) {
			case 'EXPORTING':
				element = <span style={{ color: 'white' }}>
					Exporting...this will take a few seconds
				</span>;
				break;
			case 'EXPORT_ERROR':
				element = (
					<span style={{ color: 'white', fontWeight: 'bold ' }}>
						ERROR during export!
					</span>
				);
				break;
			case 'EXPORT_ERROR_FILE_OPEN':
				element = (
					<span style={{ color: 'white', fontWeight: 'bold ' }}>
						ERROR: Close file in Word prior to export
					</span>
				);
				break;
			case 'EXPORT_SUCCESS':
				element = (
					<span style={{ color: 'white', fontWeight: 'bold ' }}>
						Successfully exported!
					</span>
				);
				break;
			default:
				// case 'READY':
				element = <a id='export-to-word-link' onClick={this.exportToWord}>
					Export to Word
				</a>;
				break;
		}

		return element;
	}

}

ExportToWordButton.propTypes = {
	procedureFile: PropTypes.string
};

module.exports = ExportToWordButton;
