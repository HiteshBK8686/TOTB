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

class PackageClass {
  static publicFields() {
    return [
      'id'
    ];
  }

  static async getDetails({ id }) {
    return await this.findOne({_id:id});
  }
}

mongoSchema.loadClass(PackageClass);

const Package = mongoose.model('Package', mongoSchema);

module.exports = Package;
