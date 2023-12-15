var mongoose = require("mongoose");
const express = require('express');
const fs = require('fs');
const AWS = require('aws-sdk');
const multipart = require('connect-multiparty');

const Restaurant = require('../models/Restaurant');
const RestaurantImage = require('../models/RestaurantImage');
const SliderImage = require('../models/SliderImage');
const Misc = require('../models/Misc');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const Visited = require('../models/Visited');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');
const Menu = require('../models/Menu');
const Review = require('../models/Review');
const ReviewImage = require('../models/ReviewImage');
var middleware = require("../middleware");

const multipartMiddleware = multipart();
var db = mongoose.connection;

const router = express.Router();

router.get('/fetch/:id', async (req, res) => {
  try {
    // 1. Fetch Restaurant Details
    var restaurant = await Restaurant.findOne({ _id: req.params.id });
    var restaurant = JSON.parse(JSON.stringify(restaurant));

    // 2. Fetch Restaurant Types and Replace into master Array
    var restaurant_types = await Misc.find({group:'restaurant-bars',type:'dinetype',_id: {"$in":restaurant.restaurant_types}});
    restaurant.restaurant_types = restaurant_types;

    // 3. Fetch Payment Methods details and Replace into master Array
    var payment_methods = await Misc.find({group:'general',type:'paymentMethod',_id: {"$in":restaurant.payment_methods}});
    restaurant.payment_methods = payment_methods;

    // 4. Fetch Cuisine Types and Replace into master Array
    var cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});
    restaurant.cuisine_types = cuisine_types;

    // 5. Fetch Restaurant Features and Replace into master Array
    var features = await Misc.find({group:'restaurant-bars',type:'feature',_id: {"$in":restaurant.features}});
    restaurant.features = features;

    // Finally, return master JSON
    res.json(restaurant);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/restaurant_images', async (req, res) => {
  try {
    var images = [];
    if(req.body.plandetails == undefined || req.body.plandetails.Photo == 'N' || req.body.plandetails.Photo == '0' || isNaN(parseInt(req.body.plandetails.Photo))){
      // do nothing
    } else{
      var images = await RestaurantImage.find({restaurant_id: req.body.id}).sort({"createdAt":-1}).limit(parseInt(req.body.plandetails.Photo));
    }
    var response = {};
    response.images = images;
    response.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';
    res.json(response);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/restaurant_places', async (req, res) => {
  try {
    var related_places = await Restaurant.find({city:req.body.city}).limit(6);
    related_places = JSON.parse(JSON.stringify(related_places));

    await Promise.all(related_places.map(async (restaurant, index) => {
      // Fetch images
      var images = await RestaurantImage.find({restaurant_id: restaurant._id});
      images = JSON.parse(JSON.stringify(images));
      related_places[index].images = images;

      // Fetch cuisine types
      var cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});
      related_places[index].cuisine_types = cuisine_types;

      // Fetch reviews
      var reviews = await Review.find({restaurant_id:restaurant._id});
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
      related_places[index].avg_review = avg_review;
      related_places[index].total_rating = total_rating;
    }));

    res.json(related_places);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/slider_images/:id', async (req, res) => {
  try {
    const images = await SliderImage.find({restaurant_id: req.params.id});
    var response = {};
    response.images = images;
    response.slider_url = process.env.ADMIN_URL + '/static/slider_images/';
    response.slider_thumb_url = process.env.ADMIN_URL + '/static/slider_thumb/';
    res.json(response);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/filterRestaurant', async (req, res) => {
  try {
    const restaurants = await Restaurant.find(req.body);
    res.json(restaurants);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    var response = {};
    const events = await Event.find({parent:req.params.id});
    response.events = events;
    response.event_image = process.env.ADMIN_URL + '/static/event_image/';
    res.json(response);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/certificates/:id', async (req, res) => {
  try {
    const certificates = await Certificate.find({parent:req.params.id});
    res.json(certificates);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/bookmark', [middleware.verifyToken], async (req, res) => {
  try {
    var user_id = req.userId;
    var restaurant_id = req.body.restaurant_id;

    var bookmark = await Bookmark.find({user_id:user_id,restaurant_id:restaurant_id});
    if(bookmark.length > 0){
      await Bookmark.find({user_id:user_id,restaurant_id:restaurant_id}).remove();
    } else{
      await Bookmark.create(req.body);
    }
    res.json({status:'success'});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/visited', [middleware.verifyToken], async (req, res) => {
  try {
    var user_id = req.userId;
    var restaurant_id = req.body.restaurant_id;

    var visited = await Visited.find({user_id:user_id,restaurant_id:restaurant_id});
    if(visited.length){
      await Visited.find({user_id:user_id,restaurant_id:restaurant_id}).remove();
    } else{
      await Visited.create(req.body);
    }
    res.json({status:'success'});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/submit_review', [middleware.verifyToken], async (req, res) => {
  try {
    var user_id = req.userId;
    var restaurant_id = req.body.restaurant_id;
    var rating_value = req.body.rating_value;
    var review_text = req.body.review_text;
    // req.body.createdAt = new Date();
    db.collection('statistics').insertOne({restaurant_id:restaurant_id,type:'review',createdAt:new Date()});
    const review = await Review.create({helpful:0,user_id:user_id,restaurant_id:restaurant_id,rating_value:rating_value,review_text:review_text,createdAt:new Date()});
    res.json(review);
  } catch (err) {
    res.json({error: err.message || err.toString() });
  }
});

router.post('/update_review', [middleware.verifyToken], async (req, res) => {
  try {
    var user_id = req.userId;
    var restaurant_id = req.body.restaurant_id;
    var rating_value = req.body.rating_value;
    var review_text = req.body.review_text;
    // req.body.createdAt = new Date();
    const review = await Review.findOneAndUpdate(
      {user_id:user_id,restaurant_id:restaurant_id},
      {$set: {rating_value:rating_value,review_text:review_text}}
    );
    res.json(review);
  } catch (err) {
    res.json({error: err.message || err.toString() });
  }
});

router.get('/reviews/:id/:page', async(req, res) => {
  try {
    var page = req.params.page;
    var limit = 10;
    var skip = (page-1)*10;
    var all_reviews = await Review.find({restaurant_id:req.params.id}).limit(limit).skip(skip);
    all_reviews = JSON.parse(JSON.stringify(all_reviews));
    await Promise.all(all_reviews.map(async (review, index) => {
      var user = await User.findOne({ _id:review.user_id });
      user = JSON.parse(JSON.stringify(user));
      all_reviews[index].user = user;

      var review_images = await ReviewImage.find({review_id: review._id});
      review_images = JSON.parse(JSON.stringify(review_images));
      all_reviews[index].review_images = review_images;
    }));

    var recent_reviews = await Review.find({restaurant_id:req.params.id}).sort({createdAt:-1}).limit(limit).skip(skip);
    recent_reviews = JSON.parse(JSON.stringify(recent_reviews));
    await Promise.all(recent_reviews.map(async (review, index) => {
      var user = await User.findOne({ _id:review.user_id });
      user = JSON.parse(JSON.stringify(user));
      recent_reviews[index].user = user;

      var review_images = await ReviewImage.find({review_id: review._id});
      review_images = JSON.parse(JSON.stringify(review_images));
      recent_reviews[index].review_images = review_images;
    }));

    var popular_reviews = await Review.find({restaurant_id:req.params.id}).sort({helpful:-1}).limit(limit).skip(skip);
    popular_reviews = JSON.parse(JSON.stringify(popular_reviews));
    await Promise.all(popular_reviews.map(async (review, index) => {
      var user = await User.findOne({ _id:review.user_id });
      user = JSON.parse(JSON.stringify(user));
      popular_reviews[index].user = user;

      var review_images = await ReviewImage.find({review_id: review._id});
      review_images = JSON.parse(JSON.stringify(review_images));
      popular_reviews[index].review_images = review_images;
    }));


    var one_star = await Review.find({restaurant_id:req.params.id,rating_value:1}).countDocuments();
    var two_star = await Review.find({restaurant_id:req.params.id,rating_value:2}).countDocuments();
    var three_star = await Review.find({restaurant_id:req.params.id,rating_value:3}).countDocuments();
    var four_star = await Review.find({restaurant_id:req.params.id,rating_value:4}).countDocuments();
    var five_star = await Review.find({restaurant_id:req.params.id,rating_value:5}).countDocuments();

    var total_reviews = one_star + two_star + three_star + four_star + five_star;
    var avg_rating = ((one_star*1) + (two_star*2) + (three_star*3) + (four_star*4) + (five_star*5))/total_reviews;
    avg_rating = Math.round(avg_rating * 10) / 10;

    var rating = Math.round(avg_rating);

    var response = {};
    response.all_reviews = all_reviews;
    response.recent_reviews = recent_reviews;
    response.popular_reviews = popular_reviews;

    response.one_star = one_star;
    response.two_star = two_star;
    response.three_star = three_star;
    response.four_star = four_star;
    response.five_star = five_star;

    response.total_reviews = total_reviews;
    response.avg_rating = avg_rating;
    response.rating = rating;

    res.json(response);
  } catch (err) {
    res.json({error: err.message || err.toString()});
  }
});

router.get('/menu/:id', async (req, res) => {
  try {
    var categories = await Menu.find({parent:0,restaurant_id:req.params.id});
    categories = JSON.parse(JSON.stringify(categories));

    await Promise.all(categories.map(async (category, index) => {
      var sub_categories = await Menu.find({parent:category._id});
      sub_categories = JSON.parse(JSON.stringify(sub_categories));
      categories[index].sub_categories = sub_categories;

      await Promise.all(sub_categories.map(async (sub_category, sub_index) => {
        var items = await Menu.find({parent:sub_category._id});
        items = JSON.parse(JSON.stringify(items));
        categories[index].sub_categories[sub_index].items = items;
      }));
    }));

    res.json({categories:categories,image_url:process.env.ADMIN_URL + '/static/item_image/'});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/review/useful/:id/:user_id', [middleware.verifyToken], async(req, res) => {
  try {
    var review_id = req.params.id;
    var user_id = req.userId;    
    await Review.findOneAndUpdate(
      { _id: review_id },
      { $inc: { helpful: 1 }}
    );

    res.json({status:'success'});
  } catch (err) {
    res.json({error: err.message || err.toString()});
  }
});

router.get('/review/not_useful/:id/:user_id', [middleware.verifyToken], async(req, res) => {
  try {
    var review_id = req.params.id;
    var user_id = req.userId;    
    await Review.findOneAndUpdate(
      { _id: review_id },
      { $inc: { helpful: -1 }}
    );

    res.json({status:'success'});
  } catch (err) {
    res.json({error: err.message || err.toString()});
  }
});

router.get('/restaurant/website_click/:restaurant_id', async(req, res) => {
  try {
    var restaurant_id = req.params.restaurant_id; 
    db.collection('statistics').insertOne({restaurant_id:restaurant_id,type:'website_click',createdAt:new Date()});
    await Restaurant.findOneAndUpdate(
      { _id: restaurant_id },
      { $inc: { website_click: 1 }}
    );

    res.json({status:'success'});
  } catch (err) {
    res.json({error: err.message || err.toString()});
  }
});

router.get('/restaurant/cellphone_click/:restaurant_id', async(req, res) => {
  try {
    var restaurant_id = req.params.restaurant_id; 
    db.collection('statistics').insertOne({restaurant_id:restaurant_id,type:'cellphone_click',createdAt:new Date()});
    await Restaurant.findOneAndUpdate(
      { _id: restaurant_id },
      { $inc: { cellphone_click: 1 }}
    );

    res.json({status:'success'});
  } catch (err) {
    res.json({error: err.message || err.toString()});
  }
});

router.get('/restaurant/email_click/:restaurant_id', async(req, res) => {
  try {
    var restaurant_id = req.params.restaurant_id; 
    db.collection('statistics').insertOne({restaurant_id:restaurant_id,type:'email_click',createdAt:new Date()});
    await Restaurant.findOneAndUpdate(
      { _id: restaurant_id },
      { $inc: { email_click: 1 }}
    );

    res.json({status:'success'});
  } catch (err) {
    res.json({error: err.message || err.toString()});
  }
});

router.get('/additional_details/:restaurant_id/:user_id', async (req, res) => {
  try {
    var user_id = req.params.user_id;
    var restaurant_id = req.params.restaurant_id;
    var response = {};

    /*Fetch Bokmared or not*/
    var bookmark = await Bookmark.find({user_id:user_id,restaurant_id:restaurant_id});
    if(bookmark.length > 0){
      response.bookmark = 1;
    } else{
      response.bookmark = 0;
    }

    /*Fetch visited or not*/
    var visited = await Visited.find({user_id:user_id,restaurant_id:restaurant_id});
    if(visited.length > 0){
      response.visited = 1;
    } else{
      response.visited = 0;
    }

    /*Fetch reviewed or not*/
    var review = await Review.find({user_id:user_id,restaurant_id:restaurant_id});
    if(review.length > 0){
      response.reviewed = 1;
      response.review = review[0];
    } else{
      response.reviewed = 0;
    }

    /*Fetch menu*/
    var menu = {};
    var categories = await Menu.find({parent:0,restaurant_id:restaurant_id});
    categories = JSON.parse(JSON.stringify(categories));
    await Promise.all(categories.map(async (category, index) => {
      var sub_categories = await Menu.find({parent:category._id});
      sub_categories = JSON.parse(JSON.stringify(sub_categories));
      categories[index].sub_categories = sub_categories;

      await Promise.all(sub_categories.map(async (sub_category, sub_index) => {
        var items = await Menu.find({parent:sub_category._id});
        items = JSON.parse(JSON.stringify(items));
        categories[index].sub_categories[sub_index].items = items;
      }));
    }));
    menu.categories = categories;
    menu.image_url = process.env.ADMIN_URL + '/static/item_image/';
    response.menu = menu;

    /*Fetch certificates*/
    const certificates = await Certificate.find({parent:req.params.id});
    response.certificates = certificates;
    
    res.json(response);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/savereviewimages', [middleware.verifyToken, multipartMiddleware], async (req, res) => {
  try {
    var user_id = req.userId;
    var review_id = req.body.review_id;
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
        Key: 'review_images/' + user_id + '/'+ file.name, // file will be saved as testBucket/contacts.csv
        Body: data,
        ACL: 'public-read',
        ContentType: 'image/jpeg',
      };
      s3.upload(params, async function(s3Err, data) {
        console.log(s3Err);
        var image = await ReviewImage.create({review_id:review_id,user_id:user_id,image:data.Location});
        res.json(image);
      });
    });
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;