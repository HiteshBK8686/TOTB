const mongoose = require('mongoose');
const _ = require('lodash');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class UserClass {
  static publicFields() {
    return [
      'id',
      'email',
      'phone',
      'status',
      'password',
      'username',
      'name',
      'profile_pic',
      'about',
      'city',
      'website',
      'verify_token',
      'email_verified'
    ];
  }

  static async signInOrSignUp({ googleId, email, googleToken, name, avatarUrl }) {
    const user = await this.findOne({ googleId });

    if (user) {
      const modifier = {};
      if (googleToken.accessToken) {
        modifier.access_token = googleToken.accessToken;
      }

      if (googleToken.refreshToken) {
        modifier.refresh_token = googleToken.refreshToken;
      }

      if (_.isEmpty(modifier)) {
        return user;
      }

      await this.updateOne({ googleId }, { $set: modifier });

      return user;
    }

    /*const newUser = await this.create({
      createdAt: new Date(),
      email,
      username,
      password,
      isAdmin: userCount === 0,
    });*/
    const newUser = await User.create({isAdmin:0, email:email, googleId:googleId, access_token:googleToken.accessToken, refresh_token:googleToken.refreshToken, name:name, profile_pic:avatarUrl});

    /*const template = await getEmailTemplate('welcome', {
      userName: username,
    });

    try {
      await sendEmail({
        from: `Kelly from Builder Book <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
        to: [email],
        subject: template.subject,
        body: template.message,
      });
    } catch (err) {
      logger.error('Email sending error:', err);
    }*/

    return newUser;
  }

  static async fbSignInOrSignUp({ facebookId, name, avatarUrl, facebookToken }) {
    const user = await this.findOne({ facebookId });

    if (user) {
      const modifier = {};
      if (facebookToken.accessToken) {
        modifier.access_token = facebookToken.accessToken;
      }

      if (facebookToken.refreshToken) {
        modifier.refresh_token = facebookToken.refreshToken;
      }

      if (_.isEmpty(modifier)) {
        return user;
      }

      await this.updateOne({ facebookId }, { $set: modifier });

      return user;
    }

    /*const newUser = await this.create({
      createdAt: new Date(),
      email,
      username,
      password,
      isAdmin: userCount === 0,
    });*/
    const newUser = await User.create({isAdmin:0, facebookId:facebookId, access_token:facebookToken.accessToken, refresh_token:facebookToken.refreshToken, name:name, profile_pic:avatarUrl});

    /*const template = await getEmailTemplate('welcome', {
      userName: username,
    });

    try {
      await sendEmail({
        from: `Kelly from Builder Book <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
        to: [email],
        subject: template.subject,
        body: template.message,
      });
    } catch (err) {
      logger.error('Email sending error:', err);
    }*/

    return newUser;
  }
}

mongoSchema.loadClass(UserClass);

const User = mongoose.model('User', mongoSchema);

module.exports = User;