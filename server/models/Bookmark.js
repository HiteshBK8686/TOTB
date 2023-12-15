const mongoose = require('mongoose');
const _ = require('lodash');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class BookmarkClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(BookmarkClass);

const Bookmark = mongoose.model('Bookmark', mongoSchema);

module.exports = Bookmark;
