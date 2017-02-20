const delayms = 1;

const expectedCurrentCity = 'New York, NY';
const expectedForecast = {
  fiveDay: [60, 70, 80, 45, 50]
};

function getCurrentCity(callback) {
  setTimeout(function () {

    const city = expectedCurrentCity;
    callback(null, city);

  }, delayms)
}

function getWeather(city, callback) {
  console.log(`Getting weather for: ${city}`);
  setTimeout(function () {

    if (!city) {
      callback(new Error('City required to get weather'));
      return;
    }

    const weather = {
      temp: 50
    };

    callback(null, weather)

  }, delayms)
}

function getForecast(city, callback) {
  console.log(`Getting forecast for: ${city}`);
  setTimeout(function () {

    if (!city) {
      callback(new Error('City required to get forecast'));
      return;
    }

    callback(null, expectedForecast);

  }, delayms)
}

function fetchWeather(city) {
  const operation = new Operation();
  getWeather(city, operation.nodeCallback);
  return operation;
}

function fetchCurrentCity() {
  const operation = new Operation();
  getCurrentCity(operation.nodeCallback);
  return operation;
}

function fetchForecast(city) {
  const operation = new Operation();
  getForecast(city, operation.nodeCallback);
  return operation;
}

suite.only('operations');

function Operation() {
  const operation = {
    successReactions: [],
    errorReactions: []
  };
  let result = false;
  let error = false;

  operation.succeed = function succeed(res) {
    result = res;
    operation.successReactions.forEach(r => r(res));
  };

  operation.fail = function fail(err) {
    error = err;
    operation.errorReactions.forEach(r => r(err));
  };

  operation.onCompletion = function setCallbacks(onSuccess, onError) {
    const noop = function () {};
    const proxyOperation = new Operation();

    const successCallback = onSuccess || noop;
    const errorCallback = onError || noop;

    const successHandler = () => {
      if (onSuccess) {
        const callbackResult = successCallback(result);
        if (callbackResult && callbackResult.then) {
          callbackResult.forwardCompletion(proxyOperation)
        }
      } else {
        return proxyOperation.succeed(result);
      }
    };

    const errorHandler = () => {
      const callbackResult = errorCallback(error);
      if (onError) {
        if (callbackResult && callbackResult.then) {
          callbackResult.forwardCompletion(proxyOperation);
          return;
        }
        proxyOperation.succeed(callbackResult);
      } else {
        proxyOperation.fail(error);
      }
    };

    if (result) {
      successHandler();
    } else if (error) {
      errorHandler();
    } else {
      operation.successReactions.push(successHandler);
      operation.errorReactions.push(errorHandler);
    }
    return proxyOperation;
  };

  operation.onFailure = function onFailure(onError) {
    return operation.then(null, onError);
  };

  operation.forwardCompletion = function forwardCompletion(op) {
    operation.then(op.succeed, op.fail);
  };

  operation.nodeCallback = function nodeCallback(err, res) {
    if (err) {
      operation.fail(err);
      return;
    }
    operation.succeed(res);
  };

  operation.then = operation.onCompletion;
  operation.catch = operation.onFailure;

  return operation;
}

// helper fcn
function doLater(func) {
  setTimeout(func, 1);
}

function fetchCurrentCityThatFails() {
  const operation = new Operation();
  doLater(() => operation.fail(new Error('GPS Broken')));
  return operation;
}

test('error fallthrough', function (done) {
  fetchCurrentCityThatFails()
    .then(function (city) {
      console.log(city);
      return fetchForecast(city);
    })
    .then(function (forecast) {
      expect(forecast).toBe(expectedForecast);
    })
    .catch(function (err) {
      done();
    })
})

test('error bypassed if not needed', function (done) {
  fetchCurrentCity()
    .catch(err => {
      console.log('ugh');
      return 'default city';
    })
    .then(function (city) {
      expect(city).toBe(expectedCurrentCity);
      done();
    });
});

test('async error recovery', function (done) {
  fetchCurrentCityThatFails()
    .catch(function (error) {
      console.log(error);
      return fetchCurrentCity();
    })
    .then(function (city) {
      expect(city).toBe(expectedCurrentCity);
      done();
    });
});

test('synchronous error recovery', function (done) {
  fetchCurrentCityThatFails()
    .catch(function (err) {
      console.log(err);
      return 'default city';
    })
    .then(function (city) {
      expect(city).toBe('default city');
      done();
    });
});

test('synchronized lexical parallelism', function (done) {
  const city = 'NYC';
  console.log('Initializing operations');
  const weatherOperation = fetchWeather(city);
  const forecastOperation = fetchForecast(city);
  console.log('Assigning completion handlers');

  weatherOperation.onCompletion((weather) => {
    forecastOperation.onCompletion((forecast) => {
      console.log(`Current Temp: ${weather.temp} in ${city} with 5 day forecast: ${forecast.fiveDay}`);
      done();
    });
  });
});

test('synchronized lexical parallelism without nesting', function (done) {
  fetchCurrentCity() // fetch the city
    .then(fetchWeather)
    .then((weather) => done());
});

test('register success callback asynchronously', function (done) {
  const successOperation = fetchCurrentCity();
  doLater(() => successOperation.onCompletion(() => done()));
});

test('register error callback asynchronously', function (done) {
  const failureOperation = fetchForecast(); // throw error by not passing a city
  doLater(() => failureOperation.onFailure(() => done()));
});

test('fetchForecast handlers for expected case', function (done) {
  const operation = fetchForecast('NYC');

  operation.onFailure(err => done(err)); // this shouldn't happen
  operation.onCompletion(res => done());
});

test('fetchForecast handlers for error case', function (done) {
  const operation = fetchForecast(null);

  operation.onCompletion(res => done(new Error('shouldn\'t succeed'))); // this shouldn't happen
  operation.onFailure(err => done());
});

test('noop if no success handler passed', function (done) {

  const operation = fetchCurrentCity();

  // noop should register for success handler
  operation.onFailure(err => done(err));

  //trigger success to ensure the noop registered
  operation.onCompletion(result => done());

});

test('noop if no error handler passed', function (done) {

  const operation = fetchWeather(null); // intentionally failing to test errors, no city argument passed to function

  // noop should register for the error handler
  operation.onCompletion(result => done(new Error('shouldn\'t succeed')));

  // trigger failure to ensure the noop registered
  operation.onFailure(err => done());

});

test('pass multiple callbacks - all of them are called', function (done) {

  const operation = fetchCurrentCity();

  const multiDone = callDone(done).afterTwoCalls();

  operation.onCompletion(result => multiDone());
  operation.onCompletion(result => multiDone());
});

test('fetchCurrentCity passes the callbacks later on', function (done) {

  // initiate operation
  const operation = fetchCurrentCity();

  // register callbacks
  operation.onCompletion(
    result => done(),
    err => done(err));

});
