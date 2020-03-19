
    
    import math from './math.js';
    var app = new math();
    import chai from 'chai';
    const expect = chai.expect;

describe("a test", function(){
  var foo = false;
  var result ;
  

  beforeEach( (done) => {
    setTimeout( () => {
      foo = true;
      result = app.add(1, 1);
      // add2 should return errors
      //result = app.add2(1, 1);
      // complete the async beforeEach
      done();
    }, 1000);
  });


  it("should pass due to foo=true", function(){
    expect(foo).equals(true);
  });

  it("should 1+1=2", function(){
    expect(result).to.be.equal(2);
  });
});

