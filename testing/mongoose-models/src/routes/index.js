const Meme = require('../models/Meme');

module.exports.allMemes = function (req, res) {
  Meme.find({ isRepost: req.params.isRepost }, function (err, memes) {
    res.send(memes);
  });
};
