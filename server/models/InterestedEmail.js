const mongoose = require('mongoose');
const _ = require('lodash');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class InterestedEmailClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(InterestedEmailClass);

const InterestedEmail = mongoose.model('InterestedEmail', mongoSchema);

module.exports = InterestedEmail;
