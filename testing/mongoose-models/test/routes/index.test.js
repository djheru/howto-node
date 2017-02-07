const expect = require('chai').expect;
const sinon = require('sinon');

const routes = require('./../../src/routes');
const Meme = require('./../../src/models/Meme');
const memeFactory = require('../memeFactory');

describe('routes', function () {
  beforeEach(function () {
    sinon.stub(Meme, 'find');
  });

  afterEach(function () {
    Meme.find.restore();
  });

  it('should return ALL the memes!', function () {
    const meme1 = memeFactory.validMeme();
    const meme2 = memeFactory.validRepostMeme();

    const expectedModels = [ meme1, meme2 ];
    Meme.find.yields(null, expectedModels);

    const req = { params: { } };
    const res = { send: sinon.stub() };

    routes.allMemes(req, res);
    sinon.assert.calledWith(res.send, expectedModels);
  });

  it('should use the isRepost flag to filter the results', function() {
    Meme.find.yields(null, []);

    const req = { params: { isRepost: true } };
    const res = { send: sinon.stub() };

    routes.allMemes(req, res);
    sinon.assert.calledWith(Meme.find, { isRepost: true });
  });
});
