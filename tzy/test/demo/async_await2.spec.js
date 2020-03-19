
    
    import math from './math.js';
    var app = new math();
    import chai from 'chai';
    const expect = chai.expect;

describe("a test", function(){
  var result ;
  
  before(async function(){
    result = await await app.add(1, 1);
  })

  it("should 1+1=2", function(){
    expect(result).to.be.equal(2);
  });
});

