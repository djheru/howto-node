const expect = require('chai').expect;
const sinon = require('sinon');

const Meme = require('../../src/models/Meme');
const memeFactory = require('../memeFactory');

describe('meme', function () {
  it('should be invalid if the name is empty', function (done) {
    const meme = new Meme();
    meme.validate(function (err) {
      expect(err.errors.name).to.exist;
      done()
    });
  });

  it('should have a validation error for isRepost if not isDank', function (done) {
    const meme = new Meme(memeFactory.invalidRepostMeme());
    meme.validate(function (err) {
      expect(err.errors.isRepost).to.exist;
      done();
    });
  });

  it('should be valid if reposting where isDank', function (done) {
    const meme = new Meme(memeFactory.validRepostMeme());
    meme.validate(function (err) {
      expect(err).to.not.exist;
      done();
    });
  });

  it('should check for reposts of the same name', sinon.test(function (done) {
    // Test code that queries the db, stubbing the db calls
    this.stub(Meme, 'findOne');
    const memeData = memeFactory.validMeme();
    const expectedName = memeData.name;
    const meme = new Meme(memeData);
    meme.hasReposts(function () {});

    sinon.assert.calledWith(Meme.findOne, {
      name: expectedName,
      isRepost: true
    });

    done();
  }));

  it('should pass boolean true to the callback if a repost of the same name exists', sinon.test(function (done) {
    const dbResponse = memeFactory.validRepostMeme();
    this.stub(Meme, 'findOne')
      .yields(null, dbResponse);
    const meme = new Meme(dbResponse);
    meme.hasReposts(function (hasReposts) {
      expect(hasReposts).to.be.true;
      done();
    });
  }));
});
