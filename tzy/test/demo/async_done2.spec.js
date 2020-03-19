import chai from 'chai';
const expect = chai.expect;
import math from './math.js';
const app = new math();


describe('', function(){
  
  it('d', function(done){
    var expected = 2;
    var result = app.async_add(1,1);
    
    //assertations
    result.then(function(data){
      expect(data).to.be.equal(expected);
      done();
    }, function(error){
      assert.fail(error);
      done();
    });
  });
  
});