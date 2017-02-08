const delayms = 1;

function getCurrentCity(callback) {
  setTimeout(function () {

    const city = "New York, NY";
    callback(null, city);

  }, delayms)
}

function fetchCurrentCity(onSuccess, onError) {
  getCurrentCity(function (err, result) {
    if (err) {
      onError(err);
    } else {
      onSuccess(result);
    }
    return;
  });
}

function getWeather(city, callback) {
  setTimeout(function () {

    if (!city) {
      callback(new Error("City required to get weather"));
      return;
    }

    const weather = {
      temp: 50
    };

    callback(null, weather)

  }, delayms)
}

function getForecast(city, callback) {
  setTimeout(function () {

    if (!city) {
      callback(new Error("City required to get forecast"));
      return;
    }

    const fiveDay = {
      fiveDay: [60, 70, 80, 45, 50]
    };

    callback(null, fiveDay)

  }, delayms)
}


suite.only('operations');
test('fetchCurrentCity with separate success and error callbacks', function (done) {
  fetchCurrentCity(res => done(), err => done(err));
});

