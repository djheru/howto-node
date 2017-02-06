'use strict';

const request = require('request');
module.exports = {
  getPopularity: function (url, callback) {
    const endpoint = `http://urls.api.twitter.com/1/urls/count.json?url=${url}`;
    request(endpoint, function (err, res, body) {
      if(err) {
        return callback(err, null);
      }

      const twitterResponse = JSON.parse(body);
      let popularity = 'LOW';
      if (twitterResponse.count >= 50) {
        popularity = 'HIGH';
      } else if (twitterResponse.count > 10) {
        popularity = 'MEDIUM';
      }
      const data = JSON.stringify({
        "url": twitterResponse.url,
        "popularity": popularity
      });
      return callback(null, data);
    });
  }
};
