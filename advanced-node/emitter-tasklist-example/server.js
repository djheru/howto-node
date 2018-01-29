const EventEmitter = require('events');

class Server extends EventEmitter {
	constructor(client) {
		super();

		this.tasks = {};
		this.taskId = 0;

		process.nextTick( () => this.emit('response', 'Type a command (help to list commands'));

		client.on('command', (command, args) => {
			// implement help, add, ls, delete
			switch (command) {
				case 'help':
				case 'add':
				case 'ls':
				case 'delete':
					this[command](args);
					break;
				default:
					this.emit('response', `Unknown command: ${command}`);
			}
		});
	}

	help() {
		this.emit('response', `
Available Commands: 

add task
ls
delete :id
		`);
	}

	add(task) {
		const taskId = ++this.taskId;
		const newTask = task.join(' ');
		this.tasks[taskId] = newTask;
		this.emit('response', `Added new task: ${newTask}`);
	}

	ls(args) {
		this.emit('response', JSON.stringify(this.tasks, null, '\t'));
	}

	delete(id) {
		delete this.tasks[id];
		this.emit('response', `Removed task: ${id}`);
	}
}

module.exports = (client) => new Server(client);
