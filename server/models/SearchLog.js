const mongoose = require('mongoose');
const _ = require('lodash');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class SearchLogClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(SearchLogClass);

const SearchLog = mongoose.model('SearchLog', mongoSchema);

module.exports = SearchLog;
