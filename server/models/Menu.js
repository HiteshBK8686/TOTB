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

class MenuClass {
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

mongoSchema.loadClass(MenuClass);

const Menu = mongoose.model('Menu', mongoSchema);

module.exports = Menu;
