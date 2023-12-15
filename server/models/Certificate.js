const mongoose = require('mongoose');
const _ = require('lodash');
const generateSlug = require('../utils/slugify');
const sendEmail = require('../mail');
const { siteURL } = require('../env');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class CertificateClass {
  static publicFields() {
    return [
      'id'
    ];
  }

  static async add({ username, email, password}) {
    return this.create({
      username,
      email,
      password,
      createdAt: new Date(),
    });
  }
}

mongoSchema.loadClass(CertificateClass);

const Certificate = mongoose.model('Certificate', mongoSchema);

module.exports = Certificate;
