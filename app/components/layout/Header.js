const React = require('react');

const headerStyle = {
	background: '#333',
	color: '#fff',
	textAlign: 'center',
	padding: '10px'
};

// const linkStyle = {
// color: '#fff',
// textDecoration: 'none'
// };

/**
 * BOILERPLATE: edit/delete at will
 */
class Header extends React.Component {
	render() {
		return (
			<header style={headerStyle}>
				<h1>Maestro</h1>
			</header>
		);
	}
}

module.exports = Header;
