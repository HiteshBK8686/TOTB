const mongoose = require('mongoose');
const _ = require('lodash');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class ReviewClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(ReviewClass);

const Review = mongoose.model('Review', mongoSchema);

module.exports = Review;
