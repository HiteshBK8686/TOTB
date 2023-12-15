const mongoose = require('mongoose');
const _ = require('lodash');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class ContactInquiryClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(ContactInquiryClass);

const ContactInquiry = mongoose.model('ContactInquiry', mongoSchema);

module.exports = ContactInquiry;
