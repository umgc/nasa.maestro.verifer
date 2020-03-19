
    
    import math from './math.js';
    var app = new math();
    import chai from 'chai';
    const expect = chai.expect;

    describe('test add', function() {
      
      //
      it('1 + 1 = 2', async () => {
        var result = await app.async_add(1, 1)
        console.log('##', result);
        expect(result).to.be.equal(2);
      });

      //
      it('1 + d = 1d', async () => {
        var result = await app.async_add(1, 'd')
        console.log('##', result);
        expect(result).to.be.equal('1d');
      });
      
    });

