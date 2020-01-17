const React = require('react');

const headerStyle = {
	background: '#333',
	color: '#fff',
	textAlign: 'center',
	padding: '5px'
};

const h1Style = {
	lineHeight: '100%',
	margin: '0px',
	fontWeight: 'normal'
};

class HeaderComponent extends React.Component {
	render() {
		return (
			<header style={headerStyle}>
				<h1 style={h1Style}>Maestro</h1>
			</header>
		);
	}
}

module.exports = HeaderComponent;
