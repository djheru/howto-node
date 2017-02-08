const delayms = 1;

function getCurrentCity(callback) {
  setTimeout(function () {

    const city = "New York, NY";
    callback(null, city);

  }, delayms)
}

function fetchCurrentCity() {
  const operation = {

    setCallbacks(onSuccess, onError){
      operation.onSuccess = onSuccess;
      operation.onError = onError;
    }
  };

  getCurrentCity(function (err, res) {
    if (err) {
      operation.onError(err);
    } else {
      operation.onSuccess(res);
    }
    return;
  });
  return operation;
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
  let operation = fetchCurrentCity();
  operation.setCallbacks(result => done(), error => done(err));
});

