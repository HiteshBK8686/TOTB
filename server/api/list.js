const express = require('express');

const Misc = require('../models/Misc');
const RestaurantImage = require('../models/RestaurantImage');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');

const {search} = require('../services');

const router = express.Router();

router.post('/filterRestaurant', async (req, res) => {
  try {
    var response = {};
    // Prepare vars and call search service
    const { name, type, location, cuisine, city } = req.body;
    const options = {name, type, location, cuisine, city};
    var restaurants = await search(options);
    // Finally, search for image of that restaurant
    restaurants = JSON.parse(JSON.stringify(restaurants));
    await Promise.all(restaurants.map(async (restaurant, index) => {
      // Fetch images
      var images = await RestaurantImage.find({restaurant_id: restaurant._id});
      images = JSON.parse(JSON.stringify(images));
      restaurants[index].images = images;

      // Fetch cuisine types
      var cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});
      cuisine_types = JSON.parse(JSON.stringify(cuisine_types));
      restaurants[index].cuisine_types = cuisine_types;

      // Fetch avg ratings
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
      restaurants[index].avg_review = avg_review;
      restaurants[index].total_rating = total_rating;
    }));
    
    response.restaurants = restaurants;
    response.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';

    res.json(response);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/searchMap', async (req, res) => {
  try {
    var response = {};
    var restaurants = await Restaurant.find(
      {
        geo:{
          $geoWithin:{
            $geometry: {
              type: "Polygon",
              coordinates:[req.body.points]
            }
          }
        }
      }
    );

    // Finally, search for image of that restaurant
    restaurants = JSON.parse(JSON.stringify(restaurants));
    await Promise.all(restaurants.map(async (restaurant, index) => {
      // Fetch images
      var images = await RestaurantImage.find({restaurant_id: restaurant._id});
      images = JSON.parse(JSON.stringify(images));
      restaurants[index].images = images;

      // Fetch cuisine types
      var cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});
      cuisine_types = JSON.parse(JSON.stringify(cuisine_types));
      restaurants[index].cuisine_types = cuisine_types;

      // Fetch avg ratings
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
      restaurants[index].avg_review = avg_review;
      restaurants[index].total_rating = total_rating;
    }));
    
    response.restaurants = restaurants;
    response.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';

    res.json(response);
  } catch (err) {
    // res.json({error: 'Selected region is not a valid polygon!'});
    // res.json({ error: err.message || err.toString() });
    res.json({ errorMessage: err.message || err.toString() });
  }
});

module.exports = router;