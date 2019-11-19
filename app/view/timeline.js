/* global moment */
'use strict';

/**
Controls the interactivity of the HTML version of a timeline - only runs in the browser
*/

// elements in the overview header
const progressSpan = document.querySelector('span#progress');
const totalDurationSpan = document.querySelector('span#total-duration');
const petSpan = document.querySelector('span#pet');
const timerButton = document.querySelector('button#timer');
const timerSpan = document.querySelector('span#start-stop');

let timerRunning = false;
const timerInterval = 1000;
const pet = moment.duration();

timerButton.onclick = () => {
	timerRunning = !timerRunning;
	timerSpan.textContent = timerRunning ? 'Stop' : 'Start';
};

setInterval(() => {
	if (timerRunning) {
		pet.add(timerInterval, 'milliseconds');
		petSpan.textContent = pet.format('HH:mm', { trim: false });
	}
}, timerInterval);

// all the step checkboxes
const stepInputs = document.querySelectorAll('input.step');

/**
 * Sets the overview progress based on the number of checkboxes
 */
function setProgress() {
	let numberCompleted = 0;
	stepInputs.forEach((s) => s.checked && numberCompleted++);

	const status = `${numberCompleted} / ${stepInputs.length}`;
	progressSpan.textContent = status;
}

function recordStepClick(event) {
	const timestamp = Date.now();
	console.log(timestamp, event.target.labels[0].textContent);
}

stepInputs.forEach((s) => {
	s.onchange = (event) => {
		setProgress();
		recordStepClick(event);
	};
});

// all the durations with a text format of (HH:MM)
const durationSpans = document.querySelectorAll('span.subtask-duration');

const totalDuration = moment.duration();
durationSpans.forEach((s) => {
	const subtaskDuration = moment.duration(s.textContent.slice(1, 6));
	totalDuration.add(subtaskDuration);
});

totalDurationSpan.textContent = `(${totalDuration.format('HH:mm', { trim: false })})`;

// initialize the overview header
setProgress();
