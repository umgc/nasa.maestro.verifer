'use strict';

/**
Controls the interactivity of the HTML version of a timeline - only runs in the browser
*/

// all the step checkboxes
const steps = document.querySelectorAll('input.step');

/**
 * Sets the overview progress based on the number of checkboxes
 */
function setProgress() {
	let numberCompleted = 0;
	steps.forEach((s) => s.checked && numberCompleted++);

	const progress = document.querySelector('span#progress');
	const status = `${numberCompleted} / ${steps.length}`;
	progress.textContent = status;
}

steps.forEach((s) => {
	s.onchange = setProgress;
});

setProgress();
