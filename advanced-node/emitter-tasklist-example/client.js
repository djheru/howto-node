const EventEmitter = require('events');
const serverFactory = require('./server');
const readline = require('readline');

const clearScreen = '\n\n\n';
// const clearScreen = '\u001B[2]\u001B[0;0f'

// create readline interface
const rl = readline.createInterface({
	// input and output streams (just use stdin/out
	input: process.stdin,
	output: process.stdout
});

const client = new EventEmitter(); //don't need to extend the class for the client in this case
const server = serverFactory(client);

server.on('response', (response) => {
	process.stdout.write(response);
	process.stdout.write(clearScreen);
	process.stdout.write('\n\> ');
});

let command, args;

rl.on('line', (input) => {
	[command, ...args] = input.split(' ');
	client.emit('command', command, args);
});
