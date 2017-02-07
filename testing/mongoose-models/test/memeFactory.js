module.exports = {
  validMeme: function () {
    return {
      name: 'ohai',
      isDank: false,
      isRepost: false
    };
  },

  validRepostMeme: function () {
    return {
      name: 'ALL the things!',
      isDank: true,
      isRepost: true
    };
  },

  invalidRepostMeme: function () {
    return {
      name: 'lolwut',
      isDank: false,
      isRepost: true
    };
  }
};
