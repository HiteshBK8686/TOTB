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

class SliderImageClass {
  static publicFields() {
    return [
      'id'
    ];
  }
}

mongoSchema.loadClass(SliderImageClass);

const SliderImage = mongoose.model('SliderImage', mongoSchema);

module.exports = SliderImage;
