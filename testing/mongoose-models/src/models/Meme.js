const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isDank: { type: Boolean },
  isRepost: {
    type: Boolean,
    validate: function (val) {
      return (val === true && this.isDank);
    }
  }
});

memeSchema.methods.hasReposts = function (cb) {
  this.model('Meme')
    .findOne({
      name: this.name,
      isRepost: true
    }, function (err, val) {
      cb(!!val);
    });
};

module.exports = mongoose.model('Meme', memeSchema);
