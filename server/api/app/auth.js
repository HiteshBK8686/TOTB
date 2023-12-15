const express = require('express');
const User = require('../../models/User');
const OTPLog = require('../../models/OTPLog');
const jwt = require("jsonwebtoken");
const md5 = require('md5');
const router = express.Router();
const { getEmailTemplate } = require('../../models/EmailTemplate');
const sendEmail = require('../../mail');

/**
 * Signup API
 */
router.post('/signup', function(req,res) {
  const {email, password, phone, name} = req.body;
  const response = {
    data: {}
  };
  User.findOne({ isAdmin:0, email:email }, function(err, userEmailExist) {
    if(userEmailExist){
      response.status = 409
      response.message = "User with same email address already exists!"
      res.json(response);
    } else{
      User.findOne({ isAdmin:0, phone:phone }, function(err, userPhoneExist) {
        if(userPhoneExist){
          response.status = 409
          response.message = "User with same phone number already exists!"
          res.json(response);
        } else{
          const verify_token = require('crypto').randomBytes(32).toString('hex');
          User.create({verify_token:verify_token, isAdmin:0, name:name, email:email, email_verified:false, password:md5(password), phone:phone}, async function(err, user) {
            if (err) {
              response.status = 500
              response.message = "Something went wrong, please try again later!"
              res.json(response);
            } else{
              const verify_link = process.env.SITE_URL + '/verify-email/' + verify_token;
              const template_for_verify_mail = await getEmailTemplate('front-verify-email', {verify_link:verify_link});
              try {
                sendEmail({
                  from: '"Verify Email" <'+process.env.FROM_EMAIL+'>', // sender address
                  to: email,
                  subject: template_for_verify_mail.subject,
                  html: template_for_verify_mail.message,
                });
              } catch (err) {
                logger.error('Email sending error:', err);
              }
              response.status = 200
              response.message = "Signup successful, verification email has been sent!"
              res.json(response);
            }
          });
        }
      });
    }
  });
});

/**
 * Login API
 */
router.post('/login', function(req, res) {
  const {email, password} = req.body;
  const response = {
    data: {}
  };
  User.findOne({ $and: [ 
    { email:email, password:md5(password), isAdmin:0 }
  ]}, function(err, user) {
    if (err) {
      response.status = 500
      response.message = "Something went wrong, please try again later!"
      res.json(response);
    } else if (!user) {
      response.status = 401
      response.message = "Incorrect credentials!"
      res.json(response);
    } else {
      if(user.status == 0){
        response.status = 401
        response.message = "User is not active!"
        res.json(response);
      } else{
        response.status = 200
        response.message = "Login successfully!"
        response.data = user
        response.accessToken = jwt.sign({ id: user._id }, 'totb-front', {expiresIn: 2592000});
        res.json(response);
      }
    }
  });
});

/**
 * SendOTP to confirm Phone number during signup
 */
router.post('/sendotp', async (req, res) => {
  const {email, phone} = req.body;
  const response = {
    data: {}
  };
  try {
    const user = await User.find({ isAdmin:0, $or: [{email}, {phone}] });
    if(user.length){
      response.status = 409
      response.message = "User with same phone number already exists!"
      res.json(response);
    } else{
      const otp = Math.floor(100000 + Math.random() * 900000);
      await OTPLog.updateOne({phone,otp:otp,expired:0},{expired:1},{multi:true});
      const otplog = await OTPLog.create({phone,otp:otp,createdAt:new Date(),expired:0});
      if(otplog){
        const client = require('twilio')(process.env.accountSid, process.env.authToken);
        try{
          client.messages
          .create({
            body: otp + ' is your 10 of The Best verification code.',
            from: process.env.fromNumber,
            to: req.body.phone
          })
          .then(message => {
            response.status = 200
            response.message = "OTP has been sent!"
            res.json(response);
          })
          .catch(e => { 
            response.status = 500
            response.message = e.message || e.toString()
            res.json(response);
          });
        } catch (err) {
          response.status = 500
          response.message = err.message || err.toString()
          res.json(response);
        }
      } else{
        response.status = 500
        response.message = "Could not send OTP!"
        res.json(response);
      }
    }
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * VerifyOTP
 */
router.post('/verifyotp', async (req, res) => {
  const {phone, otp} = req.body;
  const response = {
    data: {}
  };
  try {
    const otplog = await OTPLog.findOne({phone,otp:parseInt(otp),expired:0});
    if(otplog){
      response.status = 200
      response.message = "OTP has been verified!"
    } else{
      response.status = 404
      response.message = "Invalid OTP!"
    }
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
  }
  res.json(response);
});

/**
 * Forgot Password API
 */
router.post('/forgot-password', async (req, res) => {
  const {email} = req.body.email;
  const response = {
    data: {}
  };
  try {
    const reset_token = require('crypto').randomBytes(32).toString('hex');
    const user = await User.findOneAndUpdate(
      { email: req.body.email, isAdmin: 0 },
      { $set: {reset_token: reset_token} }
    );

    if(user){
      const reset_link = process.env.SITE_URL + '/reset-password/' + reset_token;
      const template_for_reset_pass = await getEmailTemplate('forgot-password-user', {reset_link:reset_link});
      try {
        await sendEmail({
          from: '"Reset Password" <'+process.env.FROM_EMAIL+'>', // sender address
          to: email,
          subject: template_for_reset_pass.subject,
          html: template_for_reset_pass.message,
        });
      } catch (err) {
        logger.error('Email sending error:', err);
      }
    }
    response.status = 200
    response.message = "Email with reset password link has been sent!"
    response.data = user
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    response.data = user
    res.json(response);
  }
});

/**
 * Reset Password API - This will be called from reset password web page
 */
router.post('/reset-password', async (req, res) => {
  try {
    const reset_token = req.body.reset_token;
    const password = req.body.password;

    const user = await User.findOneAndUpdate(
      { reset_token: reset_token },
      { $set: {reset_token: null, password: md5(password)} }
    );

    if(user){
      res.json({status:'success'});
    } else{
      res.json({status:'error'});
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

/**
 * Logout API
 */
router.post('/logout', async (req, res) => {
  const response = {
    data: {}
  };
  response.status = 200
  response.message = "Logout successfully!"
  res.json(response);
});

/**
 * Social Login API
 */
router.post('/sociallogin', function(req, res) {
  const {email, social_type, social_id, name, profile_pic} = req.body;
  const response = {
    data: {}
  };
  User.findOne({ $and: [ 
    { email, social_id, isAdmin:0 }
  ]}, async function(err, user) {
    if (err) {
      response.status = 500
      response.message = "Something went wrong, please try again later!"
      res.json(response);
    } else if (!user) {
      User.findOne({ isAdmin:0, email:email }, function(err, userEmailExist) {
        if(userEmailExist){
          response.status = 409
          response.message = "User with same email address already exists, pleae try to login using your email/password!"
          res.json(response);
        } else{
          const verify_token = require('crypto').randomBytes(32).toString('hex');
          User.create({verify_token, isAdmin:0, name, email, email_verified:false, social_type, social_id, profile_pic}, async function(err, user) {
            if (err) {
              response.status = 500
              response.message = "Something went wrong, please try again later!"
              res.json(response);
            } else{
              const verify_link = process.env.SITE_URL + '/verify-email/' + verify_token;
              const template_for_verify_mail = await getEmailTemplate('front-verify-email', {verify_link:verify_link});
              try {
                sendEmail({
                  from: '"Verify Email" <'+process.env.FROM_EMAIL+'>', // sender address
                  to: email,
                  subject: template_for_verify_mail.subject,
                  html: template_for_verify_mail.message,
                });
              } catch (err) {
                logger.error('Email sending error:', err);
              }
              response.status = 200
              response.message = "Signup successful, verification email has been sent!"
              res.json(response);
            }
          });
        }
      });
    } else {
      if(user.status == 0){
        response.status = 401
        response.message = "User is not active!"
        res.json(response);
      } else{
        const new_user = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: {profile_pic} },
          {
            new: true,
            upsert: true
          }
        );
        response.status = 200
        response.message = "Login successfully!"
        response.data = new_user
        response.accessToken = jwt.sign({ id: user._id }, 'totb-front', {expiresIn: 2592000});
        res.json(response);
      }
    }
  });
});

module.exports = router;