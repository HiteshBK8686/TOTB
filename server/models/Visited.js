const mongoose = require('mongoose');
const _ = require('lodash');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class VisitedClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(VisitedClass);

const Visited = mongoose.model('Visited', mongoSchema);

module.exports = Visited;
