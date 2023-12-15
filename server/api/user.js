const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const OTPLog = require('../models/OTPLog');
const Restaurant = require('../models/Restaurant');
const RestaurantImage = require('../models/RestaurantImage');
const Review = require('../models/Review');
const Bookmark = require('../models/Bookmark');
const ReviewImage = require("../models/ReviewImage");
const ListingRequest = require('../models/ListingRequest');
const Subscription = require('../models/Subscription');
var jwt = require("jsonwebtoken");
var md5 = require('md5');
const fs = require('fs');
const AWS = require('aws-sdk');
var middleware = require("../middleware");
const atob = require('atob');

const router = express.Router();
const server = express();

const { getEmailTemplate } = require('../models/EmailTemplate');
const sendEmail = require('../mail');

const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

router.post('/signup', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/sendotp', async (req, res) => {
  try {
    var user = await User.find({ isAdmin:0 ,$or: [{email: req.body.email}, {phone: req.body.phone}] });
    console.log(user);
    if(user.length){
      res.json({message:"User with same email/phone already exists!"});
    } else{
      var otp = Math.floor(100000 + Math.random() * 900000);
      await OTPLog.updateOne({phone:req.body.phone,otp:otp,expired:0},{expired:1},{multi:true});
      var otplog = await OTPLog.create({phone:req.body.phone,otp:otp,createdAt:new Date(),expired:0});
      if(otplog){
        var client = require('twilio')(process.env.accountSid, process.env.authToken);
        try{
          client.messages
          .create({
            body: otp + ' is your 10 of The Best verification code.',
            from: process.env.fromNumber,
            to: req.body.phone
          })
          .then(message => {
            res.json({status:true});
          })
          .catch(e => { 
            console.log('Got an error:', e.code, e.message); 
            res.json({ error: e.message || e.toString() });
          });
        } catch (err) {
          console.log(err);
          res.json({ error: err.message || err.toString() });
        }
      } else{
        res.json({message:"Could not sent OTP!"});
      }
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/verifyotp', async (req, res) => {
  try {
    var otplog = await OTPLog.findOne({phone:req.body.phone,otp:parseInt(req.body.otp),expired:0});
    if(otplog){
      res.json({status:true});
    } else{
      res.json({message:"Could not find OTP!"});
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/bookmarkedRestaurants', [middleware.verifyToken], async (req, res) => {
  try {
    var bookmarkedRestaurants = await Bookmark.find({user_id:req.userId});
    bookmarkedRestaurants = JSON.parse(JSON.stringify(bookmarkedRestaurants));
    await Promise.all(bookmarkedRestaurants.map(async (restaurant, index) => {
      // Fetch restaurant details
      var restaurant_details = await Restaurant.findOne({_id: restaurant.restaurant_id});
      restaurant_details = JSON.parse(JSON.stringify(restaurant_details));
      bookmarkedRestaurants[index].restaurant_details = restaurant_details;

      // Fetch images
      var images = await RestaurantImage.find({restaurant_id: restaurant.restaurant_id});
      images = JSON.parse(JSON.stringify(images));
      bookmarkedRestaurants[index].images = images;

      // Fetch avg ratings
      var reviews = await Review.find({restaurant_id:restaurant.restaurant_id});
      var avg_review = 0;
      var total_rating = 0;
      reviews = JSON.parse(JSON.stringify(reviews));
      for(var i=0; i < reviews.length; i++){
        total_rating = total_rating + reviews[i].rating_value;
      }
      if(total_rating > 0){
        avg_review = total_rating / reviews.length;
        avg_review = Math.round(avg_review * 10) / 10;
        avg_review = Math.round(avg_review);
      }
      bookmarkedRestaurants[index].avg_review = avg_review;
      bookmarkedRestaurants[index].total_rating = total_rating;
    }));
    res.json(bookmarkedRestaurants);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/removeBookmark', [middleware.verifyToken], async (req, res) => {
  try {
    var user_id = req.userId;
    var restaurant_id = req.body.restaurant_id;

    var bookmark = await Bookmark.find({user_id:user_id,restaurant_id:restaurant_id});
    if(bookmark.length > 0){
      await Bookmark.find({user_id:user_id,restaurant_id:restaurant_id}).remove();
    } else{
      
    }
    res.json({status:'success'});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/myReviews', [middleware.verifyToken], async (req, res) => {
  try {
    var myReviews = await Review.find({user_id:req.userId});
    myReviews = JSON.parse(JSON.stringify(myReviews));
    await Promise.all(myReviews.map(async (review, index) => {
      var review_images = await ReviewImage.find({review_id: review._id});
      review_images = JSON.parse(JSON.stringify(review_images));
      myReviews[index].review_images = review_images;
    }));
    res.json(myReviews);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/removeReview', [middleware.verifyToken], async (req, res) => {
  try {
    var user_id = req.userId;
    var review_id = req.body.review_id;

    var review = await Review.find({user_id:user_id,_id:review_id});
    if(review.length > 0){
      await Review.find({user_id:user_id,_id:review_id}).remove();
    } else{

    }
    res.json({status:'success'});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/addlisting', async (req, res) => {
  try {
    await ListingRequest.create(req.body);
    res.json({status:'ok'});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/saveprofile', [middleware.verifyToken] ,async (req, res) => {
  try {
    if(req.body.newpassword.length > 0){
      req.body.password = md5(req.body.newpassword);
      req.body.newpassword = null;
    }
    var userupdate_id = req.userId;
    const user = await User.findOneAndUpdate(
      { _id: userupdate_id },
      { $set: req.body }
    );
    res.json(user);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/saveprofileimage', [middleware.verifyToken,multipartMiddleware], async (req, res) => {
  try {
    var user_id = req.userId;
    var file = req.files.files;
    var tmp_path = file.path;
    fs.readFile(tmp_path, async function(err, data) {
      const s3 = new AWS.S3({
        accessKeyId: process.env.Amazon_accessKeyId,
        secretAccessKey: process.env.Amazon_secretAccessKey,
        region: process.env.Amazon_region
      });
      const params = {
        Bucket: 'totb-data', // pass your bucket name
        Key: 'profile_images/' + user_id + '/'+ file.name, // file will be saved as testBucket/contacts.csv
        Body: data,
        ACL: 'public-read',
        ContentType: 'image/jpeg',
      };
      s3.upload(params, async function(s3Err, data) {
        const user = await User.findOneAndUpdate(
          { _id: req.userId },
          { $set: {profile_pic:data.Location} },
          {new: true}
        );
        res.json(user);
      });
    });
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/checkclient', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if(user){
    res.json({status:true});
  } else{
    res.json({status:false});
  }
});

router.post('/sendotpmail', async (req, res) => {
  const {secret, email} = req.body;
  const decrypted_otp = atob(secret);
  const devided_otp = decrypted_otp / 11.7;
  const otp = parseInt(String(devided_otp).split("").reverse().join(""), 10);
  console.log(otp);
  const verification_otp = await getEmailTemplate('verification-otp', {otp});
  try {
    sendEmail({
      from: '"10 of The Best" <'+process.env.FROM_EMAIL+'>', // sender address
      to: email,
      subject: verification_otp.subject,
      html: verification_otp.message,
    });
  } catch (err) {
    logger.error('Email sending error:', err);
  }
  res.json({status:true});
});

router.post('/profile/sendotp', async (req, res) => {
  try {
    var user = await User.find({ isAdmin:0, phone:req.body.phone });
    if(user.length){
      res.json({message:"User with same phone already exists!"});
    } else{
      var otp = Math.floor(100000 + Math.random() * 900000);
      await OTPLog.updateOne({phone:req.body.phone,otp:otp,expired:0},{expired:1},{multi:true});
      var otplog = await OTPLog.create({phone:req.body.phone,otp:otp,createdAt:new Date(),expired:0});
      if(otplog){
        var client = require('twilio')(process.env.accountSid, process.env.authToken);
        try{
          client.messages
          .create({
            body: otp + ' is your 10 of The Best verification code.',
            from: process.env.fromNumber,
            to: req.body.phone
          })
          .then(message => {
            res.json({status:true});
          })
          .catch(e => { 
            console.log('Got an error:', e.code, e.message); 
            res.json({ error: e.message || e.toString() });
          });
        } catch (err) {
          console.log(err);
          res.json({ error: err.message || err.toString() });
        }
      } else{
        res.json({message:"Could not sent OTP!"});
      }
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/forgotpassword', async (req, res) => {
  try {
    const email = req.body.email;
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
    res.json({status:'ok'});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/resetpassword', async (req, res) => {
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

passport.use(new LocalStrategy(
  function(username, password, done) {
    /*Check if Login mode or Signup mode*/
    if(username.includes('___')){
      // Signup mode
      var name = username.split('___')[0];
      var email = username.split('___')[1];
      var phone = username.split('___')[2];
      User.findOne({ isAdmin:0, email:email }, function(err, userEmailExist) {
        console.log('step 1');
        if(userEmailExist){
          console.log('email exist');
          return done(null, false, { message: 'User with same email address already exists.' });
        } else{
          console.log('email dont exist');
          User.findOne({ isAdmin:0, phone:phone }, function(err, userPasswordExist) {
            console.log('check phone');
            if(userPasswordExist){
              console.log('phone exist');
              return done(null, false, { message: 'User with same phone number already exists.' });
            } else{
              console.log('create acc');
              const verify_token = require('crypto').randomBytes(32).toString('hex');
              User.create({verify_token:verify_token, isAdmin:0, name:name, email:email, email_verified:false, password:md5(password), phone:phone}, async function(err, user) {
                if (err) { return done(err); }
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
                return done(null, user);
              });
            }
          });
        }
      });
      // return done(null, false, { message: 'Incorrect credentials.' });
    } else{
      // Login mode
      User.findOne({ $and: [ 
        { email:username, password:md5(password), isAdmin:0 }
      ]}, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect credentials.' });
        } else {
          if(user.status == 0){
            return done(null, false, { message: 'User is not active.' });
          }
          return done(null, user);
        }
      });
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, User.publicFields(), (err, user) => {
    done(err, user);
  });
});

server.use(passport.initialize());
server.use(passport.session());

router.post('/login', passport.authenticate('local'), function(req, res) {
  var user = req.user;
  user = JSON.parse(JSON.stringify(user));
  user.accessToken = jwt.sign({ id: user._id }, 'totb-front', {expiresIn: 2592000});
  res.json(user);
});

router.post('/subscribe', async (req, res) => {
  try {
    const subscriber = await Subscription.findOne(
      { email: req.body.email }
    );
    if(!subscriber){
      req.body.createdAt = new Date();
      req.body.verified = 1;
      const subscribe = await Subscription.create(req.body);
      res.json({status:'success'});
    } else{
      res.json({status:'success'});
    }
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;