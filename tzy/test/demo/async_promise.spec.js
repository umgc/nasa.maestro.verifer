import math from './math.js';
var app = new math();
import chai from 'chai';
const expect = chai.expect;

//if you return a promise or promise from your it() function, Mocha will handle it for you.

describe("a test", function(){
  var result ;
  
  before(function(){
    result = app.async_add(1,1);
  });
  
  // async_add();
  it("should 1+1=2", function(){
    return app.async_add(1, 1)
    .then( result => expect(result).to.be.equal(2) );
  });
  
    // async_add();
  it("should 1+1=2", function(){
    return result
    .then( data => {
        expect(data).to.be.equal(2);
        console.log(data);
    });
  });

    // async_add();
  it("should 1+1 != 3", function(){
    return result
    .then( data => {
        expect(data==3).not.to.be.ok;
        console.log(data);
    }, function(err){
      done(err);
    });
  });

    // async_add();
  it("don't pass result", function(){
    return result
    .then( data => {
        console.log('donot pass result');
    });
  });
  
});

