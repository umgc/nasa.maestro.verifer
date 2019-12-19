const { mount, render, shallow, configure } = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

configure({ adapter: new Adapter() });

global.mount = mount;
global.render = render;
global.shallow = shallow;
