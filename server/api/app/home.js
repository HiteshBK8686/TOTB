var mongoose = require("mongoose");
const fs = require('fs');
const AWS = require('aws-sdk');
const express = require('express');
const User = require('../../models/User');
const PageTemplate = require('../../models/PageTemplate');
const Restaurant = require('../../models/Restaurant');
const RestaurantImage = require('../../models/RestaurantImage');
const Bookmark = require('../../models/Bookmark');
const Visited = require('../../models/Visited');
const Review = require('../../models/Review');
const ReviewImage = require('../../models/ReviewImage');
const Menu = require('../../models/Menu');
const Misc = require('../../models/Misc');
const Certificate = require('../../models/Certificate');
const Faq = require('../../models/Faq');
const ContactInquiry = require('../../models/ContactInquiry');
const router = express.Router();
const middleware = require("../../middleware");
const async = require('async');
var db = mongoose.connection;
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

/**
 * Fetch Places and Page Templates
 */
router.post('/places', async function(req, res) {
  const {city, type} = req.body;
  const response = {
    data: {}
  };
  async.parallel({
    templates: function(callback) {
      PageTemplate.find({city:{ '$regex' : city, '$options': 'i'  },type:type}).then(templates => {
        callback(null, templates);
      });
    },
    places: function(callback) {
      const places = {};
      Restaurant.find({deletedAt:null,status:true,published:1,trusted:true,city:{ '$regex' : city, '$options': 'i'},type:type}).then(restaurants => {
        // Finally, search for image of that restaurant
        restaurants = JSON.parse(JSON.stringify(restaurants));
        Promise.all(restaurants.map(async (restaurant, index) => {
          return RestaurantImage.find({restaurant_id: restaurant._id}).then(images => {
            images = JSON.parse(JSON.stringify(images));
            restaurants[index].images = images;
            return restaurants;
          });
        })).then(async function(result) {
          if(result.length > 0){
            restaurants = result[0];
          } else{
            restaurants = [];
          }
          places.restaurants = restaurants;
          callback(null, places);
        });
      });
    },
  }, async function(err, results) {
    response.status = 200
    response.message = "List of places & page templates!"
    response.data = results
    res.json(response);
  });
});

/**
 * Fetch Places details
 */
router.post('/place-details', [middleware.verifyToken], async function(req, res) {
    const {userId, body} = req;
    const {city, slug} = body;
    const response = {
        data: {}
    };
    let restaurant = await Restaurant.getDetails({slug: slug,city:city});
    if(restaurant){
        // restaurant found, now let's fetch additional details based on userId
        if(userId){
            /*Fetch Bokmared or not*/
            const bookmark = await Bookmark.countDocuments({user_id:userId,restaurant_id:restaurant._id});
            if(bookmark > 0){
                restaurant.bookmark = 1;
            } else{
                restaurant.bookmark = 0;
            }

            /*Fetch visited or not*/
            const visited = await Visited.countDocuments({user_id:userId,restaurant_id:restaurant._id});
            if(visited > 0){
                restaurant.visited = 1;
            } else{
                restaurant.visited = 0;
            }

            /*Fetch reviewed or not*/
            const review = await Review.countDocuments({user_id:userId,restaurant_id:restaurant._id});
            if(review > 0){
                restaurant.reviewed = 1;
            } else{
                restaurant.reviewed = 0;
            }
        }

        /*Fetch FAQs*/
        let faqs = await Faq.find({parent:restaurant._id});
        faqs = JSON.parse(JSON.stringify(faqs)); 
        restaurant.faqs = faqs;

        /*Fetch menu*/
        const menu = {};
        let categories = await Menu.find({parent:0,restaurant_id:restaurant._id});
        categories = JSON.parse(JSON.stringify(categories));
        await Promise.all(categories.map(async (category, index) => {
            let sub_categories = await Menu.find({parent:category._id});
            sub_categories = JSON.parse(JSON.stringify(sub_categories));
            categories[index].sub_categories = sub_categories;

            await Promise.all(sub_categories.map(async (sub_category, sub_index) => {
                let items = await Menu.find({parent:sub_category._id});
                items = JSON.parse(JSON.stringify(items));
                categories[index].sub_categories[sub_index].items = items;
            }));
        }));
        menu.categories = categories;
        menu.image_url = process.env.ADMIN_URL + '/static/item_image/';
        restaurant.menu = menu;

        /*Fetch certificates*/
        const certificates = await Certificate.find({parent:req.params.id});
        restaurant.certificates = certificates;

        response.status = 200
        response.message = "Restaurant details!"
        response.data = restaurant
        res.json(response);
    } else{
        response.status = 404
        response.message = "Restaurant not found!"
        res.json(response);
    }
});

/**
 * Add Review
 */
router.post('/add-review', [middleware.verifyToken], async (req, res) => {
  const response = {
    data: {}
  };
  try {
    const {userId, body} = req;
    const {restaurant_id, rating_value, review_text} = body;
    const createdAt = new Date();

    // insert into stats and then add review
    db.collection('statistics').insertOne({restaurant_id,type:'review',createdAt});
    const review = await Review.create({helpful:0,user_id:userId,restaurant_id,rating_value,review_text,createdAt});
    
    response.status = 200
    response.message = "Review submitted!"
    response.data = review
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Update Review
 */
router.post('/update-review', [middleware.verifyToken], async (req, res) => {
  const response = {
    data: {}
  };
  try {
    const {userId, body} = req;
    const {restaurant_id, rating_value, review_text} = body;
    const createdAt = new Date();

    const review = await Review.findOneAndUpdate(
      {user_id:userId,restaurant_id},
      {$set: {rating_value,review_text}}
    );
    response.status = 200
    response.message = "Review updated!"
    response.data = review
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Review upvote/downvote
 */
router.post('/review-vote', [middleware.verifyToken], async(req, res) => {
  const response = {
    data: {}
  };
  try {
    const {review_id, type} = req.body; 
    const helpful = type == 'upvote' ? 1 : -1;
    await Review.findOneAndUpdate(
      { _id: review_id },
      { $inc: { helpful }}
    );

    response.status = 200
    response.message = "Vote submitted!"
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Toggle bookmark
 */
router.post('/toggle-bookmark', [middleware.verifyToken], async (req, res) => {
  const response = {
    data: {}
  };
  try {
    const {userId, body} = req;
    const {restaurant_id} = body;

    const bookmark = await Bookmark.find({user_id:userId,restaurant_id});
    if(bookmark.length > 0){
      await Bookmark.find({user_id:userId,restaurant_id}).remove();
    } else{
      await Bookmark.create({user_id:userId,restaurant_id});
    }
    response.status = 200
    response.message = "Bookmark toggled!"
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Toggle Visited
 */
router.post('/toggle-visited', [middleware.verifyToken], async (req, res) => {
  const response = {
    data: {}
  };
  try {
    const {userId, body} = req;
    const {restaurant_id} = body;

    var visited = await Visited.find({user_id:userId,restaurant_id});
    if(visited.length){
      await Visited.find({user_id:userId,restaurant_id}).remove();
    } else{
      await Visited.create({user_id:userId,restaurant_id});
    }
    response.status = 200
    response.message = "Visited toggled!"
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

/**
 * Fetch Reviews
 */
router.get('/reviews/:restaurant_id/:page', async(req, res) => {
  const response = {
    data: {}
  };
  try {
    const {page, restaurant_id} = req.params;
    const limit = 10;
    const skip = (page-1)*10;
    let reviews = await Review.find({restaurant_id}).limit(limit).skip(skip);
    reviews = JSON.parse(JSON.stringify(reviews));
    await Promise.all(reviews.map(async (review, index) => {
      let user = await User.findOne({ _id:review.user_id });
      user = JSON.parse(JSON.stringify(user));
      reviews[index].user = user;

      let review_images = await ReviewImage.find({review_id: review._id});
      review_images = JSON.parse(JSON.stringify(review_images));
      reviews[index].review_images = review_images;
    }));

    const one_star = await Review.find({restaurant_id,rating_value:1}).countDocuments();
    const two_star = await Review.find({restaurant_id,rating_value:2}).countDocuments();
    const three_star = await Review.find({restaurant_id,rating_value:3}).countDocuments();
    const four_star = await Review.find({restaurant_id,rating_value:4}).countDocuments();
    const five_star = await Review.find({restaurant_id,rating_value:5}).countDocuments();

    const total_reviews = one_star + two_star + three_star + four_star + five_star;
    let avg_rating = ((one_star*1) + (two_star*2) + (three_star*3) + (four_star*4) + (five_star*5))/total_reviews;
    avg_rating = Math.round(avg_rating * 10) / 10;

    const rating = Math.round(avg_rating);

    const data = {};
    data.reviews = reviews;
    data.one_star = one_star;
    data.two_star = two_star;
    data.three_star = three_star;
    data.four_star = four_star;
    data.five_star = five_star;
    data.total_reviews = total_reviews;
    data.avg_rating = avg_rating;
    data.rating = rating;

    response.status = 200
    response.message = "All reviews!"
    response.data = data;
    res.json(response);
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});

router.post('/savereviewimages', [middleware.verifyToken, multipartMiddleware], async (req, res) => {
  const response = {
    data: {}
  };
  try {
    var user_id = req.userId;
    var review_id = req.body.review_id;
    var file = req.files.files;
    // console.log(req.files);
    console.log(req);
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
        response.status = 200
        response.message = "Image uploaded!"
        response.data = image;
        res.json(response)
      });
    });
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
    res.json(response);
  }
});


router.get('/collection/:slug', async(req, res) => {
  const {slug} = req.params;
  const response = {
    data: {}
  };
  let collection = await PageTemplate.findOne({ slug: slug });
  if(collection){
    // Convert format
    collection = JSON.parse(JSON.stringify(collection));
    // Fetch Restaurants
    let restaurants = await Restaurant.find({_id: {"$in":collection.restaurants}});
    restaurants = JSON.parse(JSON.stringify(restaurants));
    // Fetch Restaurant Details
    await Promise.all(restaurants.map(async (restaurant, index) => {
      // Fetch images
      let images = await RestaurantImage.find({restaurant_id: restaurant._id});
      images = JSON.parse(JSON.stringify(images));
      restaurants[index].images = images;

      // Fetch cuisine types
      let cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});
      restaurants[index].cuisine_types = cuisine_types;

      // Fetch reviews
      let reviews = await Review.find({restaurant_id:restaurant._id});
      let avg_review = 0;
      let total_rating = 0;
      reviews = JSON.parse(JSON.stringify(reviews));
      for(var i=0; i < reviews.length; i++){
        total_rating = total_rating + reviews[i].rating_value;
      }
      if(total_rating > 0){
        avg_review = total_rating / reviews.length;
        avg_review = Math.round(avg_review * 10) / 10;
        avg_review = Math.round(avg_review);
      }
      restaurants[index].avg_review = avg_review;
      restaurants[index].total_rating = total_rating;
    }));
    response.status = 200
    response.message = "Template details!"
    response.data = {
      collection,
      restaurants
    };
  } else{
    response.status = 404
    response.message = "Template not found!"
  }
  res.json(response);
});

router.post('/contactus', async(req, res) => {
  const response = {
    data: {}
  };
  try {
    await ContactInquiry.create(req.body);
    response.status = 200
    response.message = "Inquiry has been sent!"
  } catch (err) {
    response.status = 500
    response.message = err.message || err.toString()
  }
  res.json(response);
});

module.exports = router;