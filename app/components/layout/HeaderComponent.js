const React = require('react');

const headerStyle = {
	background: '#333',
	color: '#fff',
	textAlign: 'center',
	padding: '10px'
};

class HeaderComponent extends React.Component {
	render() {
		return (
			<header style={headerStyle}>
				<h1>Maestro</h1>
			</header>
		);
	}
}

module.exports = HeaderComponent;
