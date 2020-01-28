const React = require('react');
const PropTypes = require('prop-types');
const uuidv4 = require('uuid/v4');

const SummaryTimelineBlockDropLocationComponent = require('./SummaryTimelineBlockDropLocationComponent');
const SummaryTimelineBlockComponent = require('./SummaryTimelineBlockComponent');
const ReactTimelineWriter = require('../../../writer/timeline/ReactTimelineWriter');

const stateHandler = require('../../state/index');

class SummaryTimelineComponent extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			activityOrder: stateHandler.state.procedure.TasksHandler.getTaskUuids()
		};

		this.unsubscribeFns = {
			deleteTask: null,
			insertTask: null,
			moveTask: null
		};

	}

	componentDidMount() {
		for (const modelMethod in this.unsubscribeFns) {
			this.unsubscribeFns[modelMethod] = stateHandler.state.procedure.TasksHandler.subscribe(
				modelMethod,
				(newState) => {
					this.setState({ activityOrder: newState.getTaskUuids() });
				}
			);
		}
	}

	componentWillUnmount() {
		for (const modelMethod in this.unsubscribeFns) {
			this.unsubscribeFns[modelMethod](); // run each unsubscribe function
		}
	}

	render() {
		// FIXME hopefully we can make this not need to be rebuild on each render
		const timelineWriter = new ReactTimelineWriter(stateHandler.state.procedure);
		const { columnDisplay, columnWidth, timelineMarkings } = timelineWriter.create();

		const timelineStyle = {
			marginTop: '10px'
		};
		const headerStyle = {
			textAlign: 'center'
		};
		return (
			<div>
				<div style={headerStyle}>
					<h2>{stateHandler.state.procedure.name}</h2>
					<h3>Summary Timeline</h3>
				</div>
				<div className='timeline' style={timelineStyle}>
					{this.genTimelineMarkings(timelineMarkings, true)}
					{this.getColumnDisplay(columnDisplay)}
					{this.genTimelineMarkings(timelineMarkings, false)}
				</div>
			</div>
		);
	}

	genTimelineMarkings(timelineMarkings, tickBefore = true) {
		const timelineMarkingsClass = tickBefore ?
			'timeline-markings align-right' : 'timeline-markings';

		return (
			<div className="column-pet">
				<div className='column-header'></div>
				<div className={timelineMarkingsClass}>
					{timelineMarkings.map((timelineMarking) => {
						return (
							<div
								className="timeline-marking"
								style={{ height: timelineMarking.blockHeight + 'px' }}
								key={uuidv4()}
							>
								{ tickBefore ? null : <div className="tick"></div> }
								<div className="half-hour-increment">
									{timelineMarking.timeString}
								</div>
								{ tickBefore ? <div className="tick"></div> : null }
							</div>

						);
					})}
				</div>
			</div>
		);
	}

	dropOccurredEnd = () => {
		return { dropAtUuid: false };
	}

	// create a function for this dropColumnIndex
	createCanDropEnd(dropColumnIndex) {
		return (item, monitor) => {
			// .getItem() modified in useDrag.begin() above
			const { draggingUuid, draggingColumnIndex } = monitor.getItem();

			const endpoints = stateHandler.state.procedure.taskEndpoints;
			// console.log('time sync and stuff', stateHandler.state.procedure.taskEndpoints);
			// return true;
			const actors = Object.keys(endpoints);
			const endpointUuids = actors.map((actor) => {
				return endpoints[actor].last.uuid;
			});

			return dropColumnIndex === draggingColumnIndex &&
				endpointUuids.indexOf(draggingUuid) === -1;
		};
	}

	getColumnDisplay(columnDisplay) {

		return columnDisplay.map((column, columnIndex) => {
			const activityBlocksClasses = `activity-blocks activity-blocks-${columnIndex} striped-background`;

			return (
				<div className="column-ev" key={uuidv4()}>
					<div className='column-header'>
						{column.header}
					</div>
					<div className={activityBlocksClasses} style={{ position: 'relative' }}>
						{column.activityBlocks.map((activityOptions) => {
							// return this.getReactBlock(activityOptions);
							const {
								height, fillColor, textSize, marginTop,
								title, duration, uuid, minutesGap
							} = activityOptions;

							return (<SummaryTimelineBlockComponent
								height={height}
								fillColor={fillColor}
								textSize={textSize}
								marginTop={marginTop}
								title={title}
								duration={duration}
								minutesGap={minutesGap}
								uuid={uuid}
								key={uuidv4()}
								columnIndex={columnIndex}
								showTimeline={this.props.showTimeline}
								updateCurrentActivity={this.props.updateCurrentActivity}
							/>);
						})}
						<SummaryTimelineBlockDropLocationComponent
							canDropFn={this.createCanDropEnd(columnIndex)}
							dropFn={this.dropOccurredEnd}
							position='bottom'
						/>
					</div>
				</div>
			);
		});
	}

	/*
	getReactBlock({ height, fillColor, textSize, marginTop, title, duration, uuid }) {
		const blockStyle = {
			height: `${height}px`,
			backgroundColor: fillColor,
			fontSize: `${textSize}px`,
			position: 'relative'
		};
		if (marginTop) {
			blockStyle.marginTop = `${marginTop}px`;
		}

		const controlsStyle = {
			position: 'absolute',
			backgroundColor: '#eee',
			right: '2px',
			top: '2px'
		};
		return (
			<div
				key={uuid}
				data-uuid={uuid}
				className="task-block"
				style={blockStyle}
			>
				<span className='task-title'>{title}</span>
				&nbsp;
				<span className='task-duration'>({duration})</span>
				<div style={controlsStyle} className='modify-timeline-activity-controls'>
					<button onClick={this.handleViewStepsClick} data-uuid={uuid}>
						view steps
					</button>
					<button onClick={this.handleEditMetaClick} data-uuid={uuid}>
						edit metadata
					</button>
					<button onClick={this.handleMoveUpClick} data-uuid={uuid}>
						move up
					</button>
					<button onClick={this.handleMoveDownClick} data-uuid={uuid}>
						move down
					</button>
				</div>
			</div>
		);
	}*/

	handleViewStepsClick = (event) => {
		console.log(`clicked "view steps" for timeline activity ${event.target.dataset.uuid}`);
		this.props.updateCurrentActivity(event.target.dataset.uuid);
		this.props.showTimeline(false);
	}

	handleEditMetaClick = (event) => {
		console.log(`clicked "edit metadata" for timeline activity ${event.target.dataset.uuid}`);

	}

	handleMoveUpClick = (event) => {
		console.log(`clicked "move up" for timeline activity ${event.target.dataset.uuid}`);
		const th = stateHandler.state.procedure.TasksHandler;
		const taskIndex = th.getTaskIndexByUuid(event.target.dataset.uuid);
		if (taskIndex === 0) {
			console.error('Can\'t move it any further up');
			return;
		}
		th.moveTask(taskIndex, taskIndex - 1); // FIXME seems not right to have to subtract 2
		stateHandler.saveProcedureChange();
	}

	handleMoveDownClick = (event) => {
		console.log(`clicked "move down" for timeline activity ${event.target.dataset.uuid}`);
		const proc = stateHandler.state.procedure;
		const taskIndex = proc.TasksHandler.getTaskIndexByUuid(event.target.dataset.uuid);
		if (taskIndex === proc.tasks.length - 1) {
			console.error('Can\'t move it any further down');
			return;
		}
		proc.TasksHandler.moveTask(taskIndex, taskIndex + 1);
		stateHandler.saveProcedureChange();
	}

}

SummaryTimelineComponent.propTypes = {
	showTimeline: PropTypes.func.isRequired,
	updateCurrentActivity: PropTypes.func.isRequired
};

module.exports = SummaryTimelineComponent;
