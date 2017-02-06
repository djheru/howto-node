'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const expectedEndpoint = 'http://urls.api.twitter.com/1/urls/count.json?url=some-url.com';

describe('twitstat', function () {
  let twitstat;
  let request;

  before(function () {
    // Stub the dependency for request
    request = sinon.stub();
    // import the module under test using proxyquire, and
    // tell proxyquire to replace the 'request' dependency with the stub above
    twitstat = proxyquire('../lib/twitstat', { 'request': request });
  });

  it('should return LOW popularity when the url is shared fewer than 10 times', function (done) {
    const body = JSON.stringify({
      count: 9,
      url: 'http://some-url.com/'
    });

    // set up the stub
    request
      .withArgs(expectedEndpoint)
      // yields passes these arguments to the callback of the stubbed function (i.e. the request() callback)
      .yields(null, null, body);

    twitstat.getPopularity('some-url.com', function (err, data) {
      expect(err).to.be.null;
      expect(data).to.equal(JSON.stringify({
        url: 'http://some-url.com/',
        popularity: 'LOW'
      }));
      done();
    });
  });

  it('should return MEDIUM popularity when the url is shared more than 10 and less than 50 times', function (done) {
    const body = JSON.stringify({
      count: 11,
      url: 'http://some-url.com/'
    });

    request
      .withArgs(expectedEndpoint)
      .yields(null, null, body);

    twitstat.getPopularity('some-url.com', function (err, data) {
      expect(err).to.be.null;
      expect(data).to.equal(JSON.stringify({
        url: 'http://some-url.com/',
        popularity: 'MEDIUM'
      }));
      done();
    });
  });

  it('should return MEDIUM popularity when the url is shared 50 times or more', function (done) {
    const body = JSON.stringify({
      count: 50,
      url: 'http://some-url.com/'
    });

    request
      .withArgs(expectedEndpoint)
      .yields(null, null, body);

    twitstat.getPopularity('some-url.com', function (err, data) {
      expect(err).to.be.null;
      expect(data).to.equal(JSON.stringify({
        url: 'http://some-url.com/',
        popularity: 'HIGH'
      }));
      done();
    });
  });

  it('should return a populated error message if there was a problem with the Twitter request', function (done) {
    const body = JSON.stringify({
      count: 50,
      url: 'http://some-url.com/'
    });

    const expectedErr = new Error('not found');

    request
      .withArgs(expectedEndpoint)
      .yields(expectedErr, null, null);

    twitstat.getPopularity('some-url.com', function (err, data) {
      expect(data).to.be.null;
      expect(err).to.equal(expectedErr);
      done();
    });
  });

});
