const mongoose = require('mongoose');
const _ = require('lodash');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class ListingRequestClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(ListingRequestClass);

const ListingRequest = mongoose.model('ListingRequest', mongoSchema);

module.exports = ListingRequest;
