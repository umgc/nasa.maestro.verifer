import chai from 'chai';
const expect = chai.expect;

async function test(resolve){
  return resolve("Hello!");
}


describe('Using a Promise!', function(){
  
  it("Hello!==Hello!", async function() {
    var testPromise = new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve("Hello!");
        }, 200);
    });
    var result = await testPromise;
    expect(result).to.equal("Hello!");
  });
  
  it("Hello!==Hello!", async function() {
    var testPromise = new Promise(function(resolve, reject) {
        setTimeout(test(resolve), 200);
    });
    var result = await testPromise;
    expect(result).to.equal("Hello!");
  });

  it("Hello!==Hello!", async function() {
    var testPromise = new Promise(function(resolve, reject) {
        test(resolve);
    });
    var result = await testPromise;
    expect(result).to.equal("Hello!");
  });
  
  it("Hello!==Hello!", async function() {
    var testPromise = new Promise( resolve => {
        test(resolve);
    });
    var result = await testPromise;
    expect(result).to.equal("Hello!");
  });
  
});