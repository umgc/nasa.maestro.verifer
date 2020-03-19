import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import unoconv from 'unoconv-promise';

//constant
const __dirname = path.resolve();
const TEST_DOCX = path.join(__dirname, 'test/STS-134_EVA_1.docx')
const TEST_PDF = path.join(__dirname, 'test/STS-134_EVA_1.pdf')
const TEST_N_DOCX = path.join(__dirname, 'test/sample2.doc')

describe('unoconv.convert()', function () {
  this.timeout(10000)
  let child
  before(()=>{
    child = unoconv.listen({verbose: true})
  })
  it('should be rejected if docx doesn\'t exist', function (done) {
    unoconv.convert(TEST_N_DOCX)
      .then(() => {
        done(new Error('Should not pass'))
      })
      .catch((e) => {
        done()
      })
  })
  it('should convert docx into PDF and return output path', function (done) {
    //console.log(TEST_FILE_PDF)
    unoconv.run({
        file: TEST_DOCX,
        output: TEST_PDF
      })
      .then((outputPath) => {
        expect(outputPath).to.equal(TEST_PDF)
        //console.log(outputPath)
        expect(fs.existsSync(outputPath)).to.be.true
        //fs.unlinkSync(outputPath)
        done()
      })
      .catch((e) => {
        done(e)
      })
  })
  after(function() {
    child = unoconv.listen()
  });
})
