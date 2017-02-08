process.env.NODE_ENV = 'test';

const chai = require('chai');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');

const server = require('../../server');
const Book = require('../../app/models/book');
const expect = chai.expect;

mongoose.Promise = global.Promise;
chai.use(chaiHttp);

const bookData = {
  title: 'The Lord of the Rings',
  author: 'J.R.R. Tolkien',
  year: 1954,
  pages: 1170
};

describe('Books', function () {

  beforeEach(function (done) {
    Book.remove({}, function (err) {
      if (err) {
        console.log(err);
      }
      done();
    });
  });

  describe('GET /book', function () {
    it('should send a GET request to retrieve all the books', function (done) {
      chai.request(server)
        .get('/book')
        .end(function (err, res) {
          expect(res).to.include.keys('status');
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(0);
          done();
        });
    });
  });

  describe('POST /book', function () {
    it('should create a new instance', function (done) {
      chai.request(server)
        .post('/book')
        .send(bookData)
        .end(function (err, res) {
          expect(res).to.include.keys('status');
          expect(res.status).to.equal(200);
          expect(res.body).to.include.keys('message');
          expect(res.body.message).to.equal('Book added');
          expect(res.body.book).to.include.keys('title', 'author', 'year', 'pages', '_id', 'createdAt');
          done();
        });
    });

    it('should return an error for a book without a pages property', function (done) {
      const book = Object.assign({}, bookData);
      delete book.pages;

      chai.request(server)
        .post('/book')
        .send(book)
        .end(function (err, res) {
          expect(res).to.include.keys('status');
          expect(res.status).to.equal(200);
          expect(res.body).to.include.keys('errors');
          expect(res.body.errors).to.include.keys('pages');
          expect(res.body.errors.pages).to.include.keys('kind');
          expect(res.body.errors.pages.kind).to.equal('required');
          done();
        });
    });
  });

  describe('GET /book/:id', function () {
    it('should retrieve a book with the given id', function (done) {
      const book = new Book(bookData);
      book.save(function (err, book) {
        chai.request(server)
          .get(`/book/${book._id}`)
          .send(book)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.include.keys('status');
            expect(res.status).to.equal(200);
            expect(res.body).to.include.keys('title', 'author', 'year', 'pages', '_id', 'createdAt');
            expect(res.body._id).to.equal(book._id.toString());
            done();
          });
      });
    });
  });

  describe('PUT /book/:id', function () {
    it('should update the book with the given', function (done) {
      const newTitle = 'The Lion, the Witch and the Wardrobe';
      const book = new Book(bookData);
      book.save(function (err, book) {
        chai.request(server)
          .put(`/book/${book._id}`)
          .send({ title: newTitle })
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.include.keys('status');
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Book updated');
            expect(res.body.book).to.include.keys('title', 'author', 'year', 'pages', '_id', 'createdAt');
            expect(res.body.book.title).to.equal(newTitle);
            done();
          });
      });
    });
  });

   describe('DELETE /book/:id', function () {
    it('should delete the book with the given id', function (done) {
      const book = new Book(bookData);
      book.save(function (err, book) {
        chai.request(server)
          .delete(`/book/${book._id}`)
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.include.keys('status');
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Book removed');
            expect(res.body.result).to.include.keys('ok', 'n');
            expect(res.body.result.ok).to.equal(1);
            expect(res.body.result.n).to.equal(1);
            done()
          });
      });
    });
  });
});
