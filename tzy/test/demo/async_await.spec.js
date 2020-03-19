import math from './math.js';
var app = new math();
import chai from 'chai';
const expect = chai.expect;


describe("a test", function(){
  var data;
  before('d', function(){
    data = app.async_add(1,1);
  });
  
  
  it('test async_add', function(){
    app.async_add(1,1).then(result =>{
      expect(result).to.be.equal(2);
    });
  });
  
  it('test before hook', function(){
    data.then(result =>{
      expect(result).to.be.equal(2);
    });
  });
  
  it('test async_add2', function(){
    const result = app.async_add2(1,1);
    result.then(result =>{
      expect(result).to.be.equal(2);
    });
  });
  
  it('test async_add3', function(){
    app.async_add3(1,1).then(result =>{
      console.log(result);
      expect(result).to.be.equal(2);
    });
  });
  
  it('test async_add4', function(){
    app.async_add4(1,1).then(result =>{
      console.log(result);
      expect(result).to.be.equal(11);
    });
  });
  

});