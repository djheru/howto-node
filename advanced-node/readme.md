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
