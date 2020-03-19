
    
    import add from './add.js';
    import chai from 'chai';
    const expect = chai.expect;

    describe('test add', function() {
      it('1 + 1 = 2', function() {
        expect(add(1, 1)).to.be.equal(2);
      });
    });

