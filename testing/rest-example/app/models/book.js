const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  pages: { type: Number, required: true, min: 1 },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

BookSchema.pre('save', (next) => {
  const now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

module.exports = mongoose.model('Book', BookSchema);
