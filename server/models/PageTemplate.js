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

class PageTemplateClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(PageTemplateClass);

const PageTemplate = mongoose.model('PageTemplate', mongoSchema);

module.exports = PageTemplate;
