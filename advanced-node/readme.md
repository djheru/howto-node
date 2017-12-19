# Advanced Node.js

## Overview

- Node Architecture
- Node for the Web
- Working with Streams
- Concurrency Model & Event Loop
- Node for Networking
- Common Node Modules
- Clusters & Child Processes

## Node's Archictecture: V8 & libuv
- Node uses VM (V8 by default) to execute JS code
- Features listed at `node --v8-options`
- V8 features are grouped as follows
	- Shipping
		- On by default
	- Staged
		- Almost ready
		- Use --harmony (e.g. string padding functions)
	- In Progress
		- Less stable
		- `node --v8-options | grep "in progress"`

- Can use the `v8` module to `getHeapStatistics`, `setFlagsFromString` and `getHeapSpaceStatistics`
- libuv is a C library used by node, rust, julia, etc
	- Used to abstract non-blocking IO operations with a consistent API across multiple OSes
	- fs/tcp/udp/child processes
	- Includes its own thread pool
	- Provides the event loop
- http-parser
	- C Lib for http requests and responses
- c-ares
	- Async DNS queries
- OpenSSL
- zlib

## Node's CLI and REPL
- Node REPL
	- `node` from the shell
	- Pressing enter reads and executes the command
	- Displays the return value
	- Has autocomplete on any object with tab
	- Has replay with up/down arrow
	- Use `_` to capture last evaluated output 
	- Has `.` commands
		- Use `.help` for more info
		- Use `.editor` for editor mode
			- Use `ctrl-d` when done
	- Has built in `repl` module
		- Useful for creating custom repl sessions
		- requre it and call `repl.start({ configObj )`
		- Options like prompt, readable/writable streams, colors, etc
		- Can set global context in repl by using e.g. `let r = repl.start({ config }); r.context.lodash = require('lodash')`
- Node CLI
	- `-c --check` - Check syntax without executing
	- `-p --print` - Run script and prints the result
	- `-r --require` - Preload one or more modules before running

## Global Object, Process & Buffer

- `process`
	- Provides a bridge between a running node process and it's operating environment
	- Provides access to `process.env` for the environment variables
		- Read only, changing does not change the actual environment variables
	- `process.release.lts` - undefined if the current node is not LTS, otherwise the release name
	- `process.stdin/stdout/stderr` - Can't close them
	- process is an event emitter
	- `process.on('exit', () => { log('exit'); })` - Can only do synchronous operations 
	- `process.on('uncaughtException', (e) => { log(e) })` 
		- When an error bubbles to the top
		- Can do cleanup here, but be sure to exit
```javascript
process.on('exit', c => { console.log(`exiting with code: ${c}`); });
process.on('uncaughtException', e => { console.error(e); process.exit(1); /* make sure to exit */});
process.stdin.resume(); // Keep it busy so it doesn't exit
console.dog(); // throw an exception
```

- `Buffer` - Work with binary streams of data
	- A chunk of memory allocated outside of the V8 heap
	- Data can be interpreted in different ways, depending on the specified encoding
	- A low level data to represent the sequence of binary data
	- Once it's allocated, cannot be resized
	- Ways to create
		- `buffer.alloc(8)` - create a filled buffer of given size
		- `buffer.allocUnsafe(8)` - create an unfilled buffer of given size (may contain old or sensitive buffer data!)
		- `Buffer.from`
	- Useful for reading binary data like images, videos, zip files
	- Use StringDecoder for decoding Buffer objects into strings
		- It can maintain a portion of a multibyte character until the full character is received into the buffer, then 
		output the character

## Require

- Steps involved with `require()`
	- Resolving
	- Loading
	- Wrapping
	- Evaluating
	-Caching
- `module` module
```javascript
console.log(module)
/*
Module {
  id: '.',
  exports: {},
  parent: null,
  filename: '/Users/philip.damra/Sites/_etc/howto-node/index.js',
  loaded: false,
  children: [],
  paths: 
   [ '/Users/philip.damra/Sites/_etc/howto-node/node_modules',
     '/Users/philip.damra/Sites/_etc/node_modules',
     '/Users/philip.damra/Sites/node_modules',
     '/Users/philip.damra/node_modules',
     '/Users/node_modules',
     '/node_modules' ] }
*/
```
- `paths` above are the directories that require will use to find the named package when required
- Can use `require.resolve(module name)` to ensure a package exists
	- Will throw if not
- Can require using relative or absolute paths 

#### Require other types of files

- `require('modulename')` will parse in this order: 
	- `modulename.js`
	- `modulename.json` - Will parse the JSON string  data into a JSON object
	- `modulename.node` - binary (compiled addon module)
		- Compiled C++ add on
		- Use `node-gyp` to compile
	
#### Wrapping Modules

- `exports.id = 1;` - works
- `exports = { id: 1 };` - does not work
- `module.exports = { id: 1 };` - works
- `require('module').module` - The `module` module has a wrapper 
```javascript
require('module').wrapper
[ '(function (exports, require, module, __filename, __dirname) { ',
  '\n});' ]

```
- Manages scoping of variables in modules
```javascript
// in a module
console.log(arguments); // see the values of the wrapper arguments
```
- Create a combined CLI/module script
```javascript
/*
// As a CLI: 
 node consoleHeader.js 10 OHAI
 
// As a module
 const consoleHeader = require('consoleHeader');
 consoleHeader(10, 'LOLWUT');
 */
 const consoleHeader = (numStars, header) => {
 	console.log('*'.repeat(numStars));
 	console.log(header);
 	console.log('*'.repeat(numStars));
 };
 const itAModule = (require.main !== module);
 if (itAModule) {
 	consoleHeader(process.argv[2], process.argv[3]);
 } else {
 	module.exports = consoleHeader;
 }
```

#### NPM
- npm is a package repository and a CLI tool
- Can install github packages from `npm install expressjs/express` - Current master
	- `npm install expressjs/express#4.14.3` - Install a tag
	- `npm install expressjs/express#branch` - Install a branch
	- `npm install expressjs/express#sha` - Install a specific commit
- `npm ls -g --depth=0` - List the first level of the tree
- `npm ll --depth=0` - More detailed info
- `npm ls -g --depth=0 --json` - format output as JSON
- `npm update` - install a single package or all versions
- `npm install npm -g ` - update npm itself
- `npm outdated` - Outdated packages
- `npm config set save true` - save packages to package.json by default
- `npm search someterm` - search for packages by keyword
- `npm home somerepo` - open the homepage of a module
- `npm repo somerepo` - open the repository of a package
- `npm prune` - Remove packages (and their deps) that are not in the package.json

## Concurrency and the Event Loop

- Based on an event model
- Slow I/O operations are handled with events and callbacks
- Fundamental to node

#### What is I/O

- Used to label communication between a CPU process and anything external
	- Memory, disk, network, other processes
	- Communicate via signals
- Usually used to reference disk and network operations
	- These are slow
- Handling slow I/O
	- Synchronous operations 
		- Slow, blocking
	- fork() 
		- Doesn't scale
	- Threads
		- Many complications when threads use the same resources
	- Event Loop
		- Node

#### The Event Loop

- Handles external events and converts them into callback invocations
- Picks events from the event queue and pushes their callbacks to the call stack
- Started as soon as node starts executing a script
	- Stops when process exits
- Also present in browsers
- Terminology
	- Heap - Where objects are stored in memory
		- Memory allocated by VM for operations
	- Call Stack - FILO structure representing the operations to perform
		- i.e. the functions being called
		- When functions return, they are removed from the stack
- Handling slow operations
