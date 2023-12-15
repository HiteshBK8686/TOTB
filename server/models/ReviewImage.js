const mongoose = require('mongoose');
const _ = require('lodash');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class ReviewImageClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(ReviewImageClass);

const ReviewImage = mongoose.model('ReviewImage', mongoSchema);

module.exports = ReviewImage;
