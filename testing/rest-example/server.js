const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const config = require('config');

const book = require('./app/routes/book');
const port = 8080;

// db connection
console.log(config);
mongoose.connect(config.DBHost);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));

// Disable logging when testing
if(config.util.getEnv('NODE_ENV') !== 'test') {
  app.use(morgan('combined'));
}

// body parse middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

// routes
app.get('/', (req, res) => res.json({ message: 'Welcome to the bookstore' }));

app.route('/book')
  .get(book.getBooks)
  .post(book.postBook);

app.route('book/:id')
  .get(book.getBook)
  .put(book.updateBook)
  .delete(book.deleteBook);

app.listen(port, () => console.log(`Listening on port: ${port}`));

module.exports = app;
