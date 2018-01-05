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

withLog.execute(fs.readFile, __filename + '.mybutt.jpg.gif.mp4.lol'); // if you comment out the 'error' handler, the process will exit
withLog.execute(fs.readFile, './emitterasync.js');
