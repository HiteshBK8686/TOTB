const mongoose = require('mongoose');
const _ = require('lodash');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class ReviewVoteClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(ReviewVoteClass);

const ReviewVote = mongoose.model('ReviewVote', mongoSchema);

module.exports = ReviewVote;
