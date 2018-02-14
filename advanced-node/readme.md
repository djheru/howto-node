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

```
   ┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<─────┤  connections, │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
   └───────────────────────┘
```

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
	- Event Queue
		- List of events to be processed
			- Can have associated callback
		- FIFO queue
		- Invoking 
	
#### How Callbacks Work

```javascript
const slowAdd = (a, b) => {
	setTimeout(() => console.log(a+b), 4000);
}

function main() {
	slowAdd(3, 3);
	slowAdd(4, 4);
}
main();
```
1. The call to `main()` is added to the call stack (IATTCS)
2. The call to `slowAdd(3, 3)` IATTCS
3. The call to `setTimeout` IATTCS
4. The node runtime sees the call to `setTimeout` and starts a timer outside of the JS environment, with the callback
5. The call to `setTimeout` is removed from the call stack (IRFTCS)
6. The call to `slowAdd` IRFTCS
7. The call to `slowAdd(4, 4)` IIATCS
8. The call to `setTimeout` IATTCS
9. The node runtime sees the second call to `setTimeout` and starts a timer outside of the JS environment, with the callback
10. The second call to `setTimeout` IRFTCS
11. The second call to `slowAdd` IRFTCS
12. When the first timer is done, it adds the first callback to the queue
13. When the second timer is done, it adds the second callback to the queue
14. The event loop detects that the call stack is empty and the queue is not, so the first callback IATTCS
15. The call to `console.log` is added to the stack, executed, and IRFTCS
16. The call to the first callback IRFTCS
17. The event loop detects that the call stack is empty and the queue is not, so the second callback IATTCS
15. The second call to `console.log` is added to the stack, executed, and IRFTCS
16. The call to the second callback IRFTCS
17. The node process exits

- The event loop monitors the call stack and the event queue. 
- When the stack is empty, and the queue is not empty, that means there are events waiting to be processed
	- Time to call the callbacks!
- The event loop will de-queue one item and add it to the call stack
	- Continues until the queue is empty

#### setImmediate and process.nextTick

- setImmedate is a special timer that runs in the `check` phase
- Similar to a `setTimeout` of 0ms, but in some situations it will take precedence over other timeouts
- Use when you want something to get executed on the next tick of the event loop
- `process.nextTick` is similar, but does not actually execute on the next tick
	- It is outside the event loop
	- It executes in the space between the end of the current operation and when the event loop continues on to the next operation
	
## EventEmitter

- Emitter objects emit named events that cause listener functions to be called
- 2 main features
	- Emitting events
	- Registering callbacks

```javascript
const EventEmitter = require('events');

class CustomEmitter extends EventEmitter {
	// ....
}

const customEmitter = new CustomEmitter();

customEmitter.emit('anythingIWant');

customEmitter.on('anythingIWant', someListenerFunction);
```

- You can also override the `execute` function
```javascript
//Synchronous example
const EventEmitter = require('events');

class WithLog extends EventEmitter {
	execute(taskFunc) {
		console.log('before');
		this.emit('begin');
		taskFunc();
		this.emit('end');
		console.log('after');
	}
}

const withLog = new WithLog();
withLog.on('begin', () => console.log('triggering "begin"'));
withLog.on('end', () => console.log('triggering "end"'));

withLog.execute(() => console.log('About to execute up in this mutha'));

/*
before
triggering "begin"
About to execute up in this mutha
triggering "end"
after

*/
```

```javascript
//Asynchronous example
const EventEmitter = require('events');
const fs = require('fs');

class WithAsyncLog extends EventEmitter {
	execute(asyncTaskFunc, ...args) {
		console.log('execute');
		console.time('execute');
		this.emit('begin');
		asyncTaskFunc(...args, (err, data) => {
			if (err) {
				return this.emit('error', err);
			}
			this.emit('data', data);
			console.timeEnd('execute');
			this.emit('end');
		});
	}
}

const withLog = new WithAsyncLog();
withLog.on('begin', () => console.log('"begin" event emitted'));
withLog.on('data', (data) => console.log('"data" event emitted', data.toString()));
withLog.on('error', (err) => console.log('"error" event emitted', err));
withLog.on('end', () => console.log('"end" event emitted'));

withLog.execute(fs.readFile, __filename + '.mybutt.jpg.gif.mp4.lol'); 
// if you comment out the 'error' handler, the process will exit here
withLog.execute(fs.readFile, './emitterasync.js');
```

- Use the uncaughtException event for cleanup

```javascript
process.once('uncaughtException', (err) => {
	console.log(err);
	//cleanup stuffs
});
```

#### .once, .prependListener, .removeListener
- use `.once()` to have a listener function respond only once to an event
- use `.prependListener()` to attach a listener to the beginning of the listeners for that event
- you'll never guess what `.removeListener` does!

## Node Networking

## Node HTTP

## Node Common Built-in Libraries

#### Working with the OS

```javascript
const os = require('os');
os.hosname();
os.cpus();
os.networkInterfaces()
os.freemem();
os.type(); // e.g. 'Darwin'
os.tempdir()/os.tempDir()
os.homedir();
os.platform();
os.EOL //property containing e.g. '\n'
os.userInfo();
```

#### Filesystem

- Has sync and async versions of the methods
	- sync versions throw, async passes errors to the first arg of the callback

```javascript
const fs = require('fs');

// returns a buffer if the encoding is not specified
const data = await fs.readFile(filename, (e, data) => { if (e) { throw e; } else { Promise.resolve(data); }});
const data = fs.readFileSync(filename);
```

```javascript
// script to truncate each file in a directory in half 
const fs = require('fs');
const path = require('path');
const dirname = path.join(__dirname, 'files');

// read the list of files
const files = fs.readdirSync(dirname); // can't do anything without this, so sync is ok
files.forEach(file => {
	// get the file path
	const filePath = path.join(dirname, file);
	// get the file meta info (including size)
	fs.stat(filePath, (e, stats) => {
		if (e) throw e;
		// truncate the file
		fs.truncate(filePath, stats.size/2, (e) => {
			if (e) throw e;
		});
	});
});
```

```javascript
// script to delete all files older than 7 days in a directory
// use test directory to, uh, test

const fs = require('fs');
const path = require('path');
const dirname = path.join(__dirname, 'testfiles');

fs.mkdirSync(dirname); // can't do anything without this, so sync is ok
const ms1Day = 24*60*60*1000;

// create files to test
for(let i=0; i<10; i++) {
	const filePath = path.join(dirname, `file-${i}`);
	fs.writeFile(filePath, i, (e) => {
		if (e) throw e;
		
		const time = (Date.now() - i*ms1Day)/1000; // Timestamp in seconds
		// utimes changes the access time and modified time of the file
		fs.utimes(filePath, time, time, (e) => {
			if (e) throw e;
		});
	});
}

// remove the old

const files = readdirSync(dirname);
files.forEach(file => {
	const filePath = path.join(dirname, file);
	// get the mtime with stat
	fs.stat(filePath, (e, stats) => {
		if (e) throw e;
		if ((Date.now() - stats.mtime.getTime()) > 7 * ms1Day) {
			fs.unlink(filePath, (e) => {
				if (e) throw e;
				console.log('deleted', filePath);
			});
		}
	});
});

```

#### Console and Utilities
- Node has a Console class that we can use to write to any stream
- Also has a global console instance object that is configured to write to stdout and stderr
- To write to different streams, you can instantiate a new Console instance, and pass it the streams as constructor args
```javascript
// Example of custom Console instnace
const fs = require('fs');

const out = fs.createWriteStream('./out.log');
const err = fs.createWriteStream('./err.log');

const myConsole = new console.Console(out, err);

setInterval(function () {
	myConsole.log(new Date());
	myConsole.error(new Error('lolded'));
}, 5000);
```
```
Console {
  log: [Function: bound ], // big, heavy, wood
  info: [Function: bound ], // alias to log
  warn: [Function: bound ], // alias to console.error
  error: [Function: bound ], // like log, but to stderr
  dir: [Function: bound ], // can pass the second arg of options for util.inspect (e.g. depth)
  time: [Function: bound ], // used for timer. Pass it an identifier, it starts the timer
  timeEnd: [Function: bound ], // used for timer. pass it an identifier, it stops the timer and returns the time elapsed
  trace: [Function: bound trace], // like console.error, but prints the stack trace
  assert: [Function: bound ], // throws exception if arg resolves to false, or returns undefined
  Console: [Function: Console] }

```

- util.format  - printf style formatting
- util.inspect - used by console
	- `util.inspect(global, { depth: 1 });`
- util.debuglog - console log that only writes if NODE_DEBUG=<instantiation arg>
```javascript
const debugLog = util.debuglog('foo');
debugLog('ohai');//only displays if NODE_DEBUG=foo
```

```
assert
{ [Function: ok]
  AssertionError: 
   { [Function: AssertionError]
     super_: 
      { [Function: Error]
        captureStackTrace: [Function: captureStackTrace],
        stackTraceLimit: 10 } },
  fail: [Function: fail],
  ok: [Circular],
  equal: [Function: equal],
  notEqual: [Function: notEqual],
  deepEqual: [Function: deepEqual],
  deepStrictEqual: [Function: deepStrictEqual],
  notDeepEqual: [Function: notDeepEqual],
  notDeepStrictEqual: [Function: notDeepStrictEqual],
  strictEqual: [Function: strictEqual],
  notStrictEqual: [Function: notStrictEqual],
  throws: [Function],
  doesNotThrow: [Function],
  ifError: [Function] } // Throws if the arg is truthy, a la error arg for callbacks

```

#### Debugging

- Start debugger by adding 'debug' after node when executing
- Debugger connects and listens on a port
- You can type 'help' for commands
- Add breakpoints by using sb(line number) cmd
- Add watch expressions with watch('variable name')

- Integrates with chrome debugger
	- `node --inspect --debug-brk yourscript.js`
	- gives you a url to open in chrome
	- can use debugger in chrome

## Node Streams

- Allow you to compose functionality
- Readable and Writable Streams
- Collections of data
- They may not all be available all at once
- Don't have to fit in memory all at once

