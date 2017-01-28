const express = require('express');
const debug = require('debug');
const app = express();

// DEBUG MODULE
// debug gives you a function
// Call the function with a string key to represent the log level
// This gives you a debug function you can call with messages
// Create a DEBUG env variable with that key to display the messages for that log level
// e.g. DEBUG=lol:warn,lol:error,lol:mybutt node index.js
// or DEBUG=lol:* node index.js
const debugWarn = debug('lol:warn');
const debugErr = debug('lol:error');
const debugButt = debug('lol:mybutt');

app.get('/', (req, res) => {
  debugErr('ohno');
  debugWarn('careful!');
  debugButt('mybutt');
  const response = { status: 'ohai' };
  debugger;
  res.send(response);
});

app.listen(3000);

// NODE DEBUGGER
// Pass "debug" to the node command
// e.g. node debug index.js
// Something like:
/*
 ➜  debugging git:(master) ✗ node debug index.js
 < Debugger listening on 127.0.0.1:5858
 connecting to 127.0.0.1:5858 ... ok
 break in index.js:1
 > 1 const express = require('express');
 2 const debug = require('debug');
 3 const app = express();
 debug>
 */

// You have an initial breakpoint at first line.
// You can continue to the next line by entering "n" (next) at the prompt
// You can continue the app running by entering "c" (continue) at the prompt
// You can enter the repl by typing "repl" at the prompt
/*
 debug> repl
 Press Ctrl + C to leave debug repl
 > response
 { status: 'ohai' }
 debug> .exit
 ➜  debugging git:(master) ✗
 */
// You can exit with ".exit"

