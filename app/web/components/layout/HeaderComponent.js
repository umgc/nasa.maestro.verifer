const React = require('react');

// const headerStyle = {
// 	position: 'absolute',
// 	top: 0,
// 	left: 0,
// 	right: 0,
// 	// width: '100%',

// 	background: '#333',
// 	color: '#fff',
// 	textAlign: 'left',
// 	padding: '5px',
// 	boxShadow: '2px 0 4px rgba(0,0,0,0.5)'
// };

// const h1Style = {
// 	lineHeight: '100%',
// 	margin: '0 10px',
// 	fontWeight: 'normal',
// 	textSize: '12px'
// };

class HeaderComponent extends React.Component {
	render() {
		return (
			<header id='main-header'>
				<h1>Maestro</h1>
			</header>
		);
	}
}

module.exports = HeaderComponent;
