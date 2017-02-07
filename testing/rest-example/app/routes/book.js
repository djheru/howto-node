const Book = require('../models/book');

module.exports = {
  getBooks(req, res) {
    const query = Book.find({});
    query.exec((err, books) => {
      if (err) {
        return res.send(err);
      }
      return res.json(books);
    });
  },

  postBook(req, res) {
    const newBook = new Book(req.body);
    newBook.save((err, book) => {
      if (err) {
        return res.send(err);
      }
      return res.json({ message: 'Book added', book })      ;
    });
  },

  getBook(req, res) {
    Book.findById(req.params.id, (err, book) => {
      if (err) {
        return res.send(err);
      }
      return res.json(book);
    });
  },

  deleteBook(req, res) {
    Book.remove({ _id: req.params.id }, (err, result) => {
      if (err) {
        return res.send(err);
      }
      return res.json({ message: 'Book deleted', result })
    });
  },

  updateBook(req, res) {
    Book.findById({ _id: req.params.id }, (err, book) => {
      if (err) {
        return res.send(err);
      }
      Object.assign(book, req.body)
        .save((err, book) => {
          if (err) {
            return res.send(err);
          }
          return res.json({ message: 'Book updated', book });
      });
    });
  }
};
