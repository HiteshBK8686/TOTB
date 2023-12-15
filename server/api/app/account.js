const express = require('express');
const User = require('../../models/User');
const Bookmark = require('../../models/Bookmark');
const Restaurant = require('../../models/Restaurant');
const RestaurantImage = require('../../models/RestaurantImage');
const Review = require('../../models/Review');
const ReviewImage = require('../../models/ReviewImage');
const OTPLog = require('../../models/OTPLog');
const jwt = require("jsonwebtoken");
const md5 = require('md5');
const router = express.Router();
const { getEmailTemplate } = require('../../models/EmailTemplate');
const sendEmail = require('../../mail');
const middleware = require("../../middleware");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

/**
 * Get Profile API
 */
router.get('/profile', [middleware.verifyToken], async function(req,res) {
  const {userId} = req;
  const response = {
    data: {}
  };
  try {
    const user = await User.findOne({_id: userId});
    if(user){
      response.status = 200
      response.message = "User details!"
      response.data = user
      res.json(response);
    } else{
      response.status = 404
      response.message = "User not found!"
      res.json(response);
    }
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Save Profile API
 */
router.post('/profile', [middleware.verifyToken], async function(req, res) {
  const {userId, body} = req;
  const {newpassword} = body;
  const response = {
    data: {}
  };
  if(newpassword && newpassword.length > 0){
    body.password = md5(body.newpassword);
    body.newpassword = null;
  }
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $set: body }
  );
  response.status = 200
  response.message = "Profile has been updated!"
  response.data = user
  res.json(response);
});

/**
 * SendOTP to confirm Phone number from Profile
 */
router.post('/sendotp', async (req, res) => {
  const {phone} = req.body;
  const {userId} = req;
  const response = {
    data: {}
  };
  try {
    const user = await User.find({ isAdmin:0, phone:phone });
    if(user.length){
      response.status = 409
      response.message = "User with same phone already exists!"
      res.json(response);
    } else{
      const otp = Math.floor(100000 + Math.random() * 900000);
      await OTPLog.updateOne({phone,otp,expired:0},{expired:1},{multi:true});
      const otplog = await OTPLog.create({phone,otp,createdAt:new Date(),expired:0});
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
            response.message = "OTP Sent!"
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
        response.message = "Could not send OTP"
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
 * Fetch Bookmarks API
 */
router.get('/bookmarks', [middleware.verifyToken], async (req, res) => {
  const {userId} = req;
  const response = {
    data: {}
  };
  try {
    let bookmarks = await Bookmark.find({user_id:userId});
    bookmarks = JSON.parse(JSON.stringify(bookmarks));
    await Promise.all(bookmarks.map(async (restaurant, index) => {
      // Fetch restaurant details
      let restaurant_details = await Restaurant.findOne({_id: restaurant.restaurant_id});
      restaurant_details = JSON.parse(JSON.stringify(restaurant_details));
      bookmarks[index].restaurant_details = restaurant_details;

      // Fetch images
      let images = await RestaurantImage.find({restaurant_id: restaurant.restaurant_id});
      images = JSON.parse(JSON.stringify(images));
      bookmarks[index].images = images;

      // Fetch avg ratings
      let reviews = await Review.find({restaurant_id:restaurant.restaurant_id});
      let avg_review = 0;
      let total_rating = 0;
      reviews = JSON.parse(JSON.stringify(reviews));
      for(let i=0; i < reviews.length; i++){
        total_rating = total_rating + reviews[i].rating_value;
      }
      if(total_rating > 0){
        avg_review = total_rating / reviews.length;
        avg_review = Math.round(avg_review * 10) / 10;
        avg_review = Math.round(avg_review);
      }
      bookmarks[index].avg_review = avg_review;
      bookmarks[index].total_rating = total_rating;
    }));
    response.status = 200
    response.data = bookmarks
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Remove Bookmark API
 */
router.post('/remove-bookmark', [middleware.verifyToken], async (req, res) => {
  const {userId,body} = req;
  const {restaurant_id} = body; 
  const response = {
    data: {}
  };
  try {
    const bookmark = await Bookmark.find({user_id:userId,restaurant_id});
    if(bookmark.length > 0){
      await Bookmark.find({user_id:userId,restaurant_id}).remove();
    }
    response.status = 200
    response.message = "Bookmark removed!"
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Fetch Reviews API
 */
router.get('/reviews', [middleware.verifyToken], async (req, res) => {
  const response = {
    data: {}
  };
  try {
    let reviews = await Review.find({user_id:req.userId});
    reviews = JSON.parse(JSON.stringify(reviews));
    await Promise.all(reviews.map(async (r, i) => {
      let review_images = await ReviewImage.find({review_id: r._id});
      review_images = JSON.parse(JSON.stringify(review_images));
      reviews[i].review_images = review_images;
    }));
    response.status = 200
    response.message = "Got reviews!"
    response.data = reviews
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Remove Review API
 */
router.post('/remove-review', [middleware.verifyToken], async (req, res) => {
  const {userId,body} = req;
  const {review_id} = body;
  const response = {
    data: {}
  };
  try {
    const review = await Review.find({user_id:userId,_id:review_id});
    if(review.length > 0){
      await Review.find({user_id:userId,_id:review_id}).remove();
    }
    response.status = 200
    response.message = "Review removed!"
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Update Profile Image
 */
router.post('/profile-image', [middleware.verifyToken,multipartMiddleware], async (req, res) => {
  const user_id = req.userId;
  const file = req.files.files;
  const tmp_path = file.path;
  const response = {
    data: {}
  };
  try {
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
        response.status = 200
        response.message = "Review removed!"
        response.data = user
        res.json(response);
      });
    });
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Get Sidemenu URLs
 */
router.get('/sidemenu', async (req, res) => {
  const response = {
    data: {}
  };
  response.status = 200
  response.message = "Sidemenu URLs"
  response.data = {
    about:'http://10ofthebest.com.au/about',
    contact:'https://10ofthebest.com.au/contact',
    faq:'https://www.10ofthebest.com.au/help'
  }
  res.json(response);
});

module.exports = router;