var mongoose = require("mongoose");
const express = require('express');
const Restaurant = require('../../models/Restaurant');
const RestaurantImage = require('../../models/RestaurantImage');
const Misc = require('../../models/Misc');
const Review = require('../../models/Review');
const SearchLog = require('../../models/SearchLog');
const router = express.Router();
var db = mongoose.connection;

/**
 * Quick Search API
 */
router.post('/quick-search', async(req,res) => {
  const response = {
    data: {}
  };
  const {name, city, type, capacity, limit} = req.body;

  // we're using single API for both search types so let's declare group and type variables for further use
  let miscGroup, miscType, restaurantType, restaurantTypeKey = null;
  if(type == 'restaurants'){
    miscGroup = 'restaurant-bars';
    miscType = 'venuetype';
    restaurantType = 'restaurant_bars';
    restaurantTypeKey = 'restaurant_types';
  } else{
    miscGroup = 'venues';
    miscType = 'dinetype';
    restaurantType = 'venues';
    restaurantTypeKey = 'venue_types';
  }

  // begin search logic
  try {
		const data = {};
		// 1. Fetch Restaurant Types
		let typess = await Misc.find({group:miscGroup,type:miscType,name:{ '$regex' : name, '$options': 'i'  }});
		let typess_ids = [];
		typess.forEach(function(type) { typess_ids.push(type._id.toString()) });

		// 2. initiate search object
		const searchQuery = {};
		searchQuery.type = restaurantType;
		searchQuery.published = 1;
		searchQuery.status = true;
    searchQuery.city = {$regex : city, $options : 'i'};
		searchQuery.$or = [
			{"name" : { '$regex' : name, '$options': 'i'  }},
			{restaurantTypeKey: {$in : typess_ids}}
		];
		if(capacity != ''){
			searchQuery.capacity = { $gte: capacity }
		}

		// 3. Now, search into restaurant
		let restaurants = await Restaurant.find(searchQuery).limit(limit);
		SearchLog.create({search:name,createdAt:new Date()});
		restaurants.forEach(function(restaurant) { db.collection('statistics').insertOne({restaurant_id:restaurant._id,type:'impression',createdAt:new Date()}) });
		await Restaurant.updateOne(
			searchQuery,
			{ 
				$inc: { impressions: 1 } 
			}
		);

		// 4. Finally, search for image of that restaurant
		restaurants = JSON.parse(JSON.stringify(restaurants));
		await Promise.all(restaurants.map(async (restaurant, index) => {
			let images = await RestaurantImage.find({restaurant_id: restaurant._id});
			images = JSON.parse(JSON.stringify(images));
			restaurants[index].images = images;

			// Fetch cuisine types
			let cuisine_types = await Misc.find({group:miscGroup,type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});
			cuisine_types = JSON.parse(JSON.stringify(cuisine_types));
			restaurants[index].cuisine_types = cuisine_types;
	  
			// Fetch avg ratings
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
		
		data.restaurants = restaurants;
		data.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';

		response.status = 200
		response.message = "Quick search respnose!"
		response.data = data;
		res.json(response);
	} catch (err) {
		response.status = 500
		response.message = err.message || err.toString()
		res.json(response);
	}
});

/**
 * Search Restaurant by Keyword
 */
router.post('/restaurants', async(req,res) => {
  const response = {
    data: {}
  };
  const {name, city, cuisine} = req.body;
  try {
		const data = {};
		// 1. Fetch Restaurant Types
		let restaurant_types = await Misc.find({group:'restaurant-bars',type:'dinetype',name:{ '$regex' : name, '$options': 'i'  }});
		let restaurant_types_ids = [];
		restaurant_types.forEach(function(type) { restaurant_types_ids.push(type._id.toString()) });

		// 2. initiate search object
		const searchQuery = {};
		searchQuery.type = 'restaurant_bars';
		searchQuery.published = 1;
		searchQuery.status = true;
    	searchQuery.city = {$regex : city, $options : 'i'};
		searchQuery.$or = [
			{"name" : { '$regex' : name, '$options': 'i'  }},
			{"restaurant_types": {$in : restaurant_types_ids}}
		];
		if(cuisine != undefined && cuisine.length > 0){
		searchQuery.cuisine_types = {$in : cuisine};
		}

		// 3. Now, search into restaurant
		let restaurants = await Restaurant.find(searchQuery);
		SearchLog.create({search:name,createdAt:new Date()});
		restaurants.forEach(function(restaurant) { db.collection('statistics').insertOne({restaurant_id:restaurant._id,type:'impression',createdAt:new Date()}) });
		await Restaurant.updateOne(
			searchQuery,
			{ 
				$inc: { impressions: 1 } 
			}
		);

		// 4. Finally, search for image of that restaurant
		restaurants = JSON.parse(JSON.stringify(restaurants));
		await Promise.all(restaurants.map(async (restaurant, index) => {
			let images = await RestaurantImage.find({restaurant_id: restaurant._id});
			images = JSON.parse(JSON.stringify(images));
			restaurants[index].images = images;

			// Fetch cuisine types
			let cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});
			cuisine_types = JSON.parse(JSON.stringify(cuisine_types));
			restaurants[index].cuisine_types = cuisine_types;
	  
			// Fetch avg ratings
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
		
		data.restaurants = restaurants;
		data.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';

		response.status = 200
		response.message = "All filtered restaurants!"
		response.data = data;
		res.json(response);
	} catch (err) {
		response.status = 500
		response.message = err.message || err.toString()
		res.json(response);
	}
});

/**
 * Fetch Cuisine Types
 */
router.get('/cuisine-types', async(req,res) => {
	const response = {
		data: {}
	};
	const cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype'});
	response.status = 200
	response.message = "All cuisine types!"
	response.data = cuisine_types;
	res.json(response);
});

/**
 * Search Venues by Keyword
 */
router.post('/venues', async (req, res) => {
  const response = {
    data: {}
  };
  const {name, capacity, city, cuisine} = req.body;
	try {
		const data = {};
		// 1. Fetch Restaurant Types
		let venue_types = await Misc.find({group:'venues',type:'venuetype',name:{ '$regex' : name, '$options': 'i'  }});
		let venue_types_ids = [];
		venue_types.forEach(function(type) { venue_types_ids.push(type._id.toString()) });

		// 2. initiate search object
		const searchQuery = {};
		searchQuery.type = 'venues';
		searchQuery.published = 1;
		searchQuery.status = true;
    	searchQuery.city = {$regex : city, $options : 'i'};
		searchQuery.$or = [
			{"name" : { '$regex' : name, '$options': 'i'  }},
			{"venue_types": {$in : venue_types_ids}}
		];
		if(cuisine != undefined && cuisine.length > 0){
		searchQuery.cuisine_types = {$in : cuisine};
		}
		if(capacity != ''){
			searchQuery.capacity = { $gte: capacity }
		}

		// 3. Now, search into restaurant
		let restaurants = await Restaurant.find(searchQuery);
		SearchLog.create({search:name,createdAt:new Date()});
		restaurants.forEach(function(restaurant) { db.collection('statistics').insertOne({restaurant_id:restaurant._id,type:'impression',createdAt:new Date()}) });
		await Restaurant.updateOne(
			searchQuery,
			{ 
				$inc: { impressions: 1 } 
			}
		);

		// 4. Finally, search for image of that restaurant
		restaurants = JSON.parse(JSON.stringify(restaurants));
		await Promise.all(restaurants.map(async (restaurant, index) => {
			let images = await RestaurantImage.find({restaurant_id: restaurant._id});
			images = JSON.parse(JSON.stringify(images));
			restaurants[index].images = images;

			// Fetch cuisine types
			let cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});
			cuisine_types = JSON.parse(JSON.stringify(cuisine_types));
			restaurants[index].cuisine_types = cuisine_types;
	  
			// Fetch avg ratings
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
		
		data.restaurants = restaurants;
		data.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';

		response.status = 200
		response.message = "All filtered venues!"
		response.data = data;
		res.json(response);
	} catch (err) {
		response.status = 500
		response.message = err.message || err.toString()
		res.json(response);
	}
});

module.exports = router;