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

class SubscriptionClass {
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

mongoSchema.loadClass(SubscriptionClass);

const Subscription = mongoose.model('Subscription', mongoSchema);

module.exports = Subscription;
