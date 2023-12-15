var mongoose = require("mongoose");
const express = require('express');
const Misc = require('../models/Misc');
const RestaurantImage = require('../models/RestaurantImage');
const Restaurant = require('../models/Restaurant');
const PageTemplate = require('../models/PageTemplate');
const SearchLog = require('../models/SearchLog');
const InterestedEmail = require('../models/InterestedEmail');
var request = require('request');

var db = mongoose.connection;
const router = express.Router();

router.post('/filterTemplates', async (req, res) => {
	try {
		const templates = await PageTemplate.find(req.body);
		var response = {};
		response.templates = templates;
		response.template_image_url = process.env.ADMIN_URL + '/static/template_images/';
		res.json(response);
	} catch (err) {
		res.json({ error: err.message || err.toString() });
	}
});

router.post('/filterRestaurant', async (req, res) => {
	try {
		var response = {};
		// 1. Fetch Restaurant Types
		var restaurant_types = await Misc.find({group:'restaurant-bars',type:'dinetype',name:{ '$regex' : req.body.name, '$options': 'i'  }});
		var restaurant_types_ids = [];
		restaurant_types.forEach(function(type) { restaurant_types_ids.push(type._id.toString()) });

		var restaurant_cuisines = await Misc.find({group:'restaurant-bars',type:'cuisinetype',name:{ '$regex' : req.body.name, '$options': 'i'  }});
		var restaurant_cuisines_ids = [];
		restaurant_cuisines.forEach(function(type) { restaurant_cuisines_ids.push(type._id.toString()) });

		var restaurant_features = await Misc.find({group:'restaurant-bars',type:'feature',name:{ '$regex' : req.body.name, '$options': 'i'  }});
		var restaurant_features_ids = [];
		restaurant_features.forEach(function(type) { restaurant_features_ids.push(type._id.toString()) });

		// initiate search object
		var searchQuery = {};
		searchQuery.type = 'restaurant_bars';
		searchQuery.published = 1;
		searchQuery.status = true;
		searchQuery.$or = [
			{"name" : { '$regex' : req.body.name, '$options': 'i'  }},
			{"restaurant_types": {$in : restaurant_types_ids}},
			{"cuisine_types": {$in : restaurant_cuisines_ids}},
			{"features": {$in : restaurant_features_ids}}
		];

		// Now, search into restaurant
		var restaurants = await Restaurant.find(searchQuery);
		SearchLog.create({search:req.body.name,createdAt:new Date()});
		restaurants.forEach(function(restaurant) { db.collection('statistics').insertOne({restaurant_id:restaurant._id,type:'impression',createdAt:new Date()}) });
		await Restaurant.updateOne(
			searchQuery,
			{ 
				$inc: { impressions: 1 } 
			}
		);
		// Finally, search for image of that restaurant
		restaurants = JSON.parse(JSON.stringify(restaurants));
		await Promise.all(restaurants.map(async (restaurant, index) => {
			var images = await RestaurantImage.find({restaurant_id: restaurant._id});
			images = JSON.parse(JSON.stringify(images));
			restaurants[index].images = images;
		}));
		
		response.restaurants = restaurants;
		response.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';

		res.json(response);
	} catch (err) {
		res.json({ error: err.message || err.toString() });
	}
});

router.post('/filterVenues', async (req, res) => {
	try {
		var response = {};
		// 1. Fetch Restaurant Types
		var venue_types = await Misc.find({group:'venues',type:'venuetype',name:{ '$regex' : req.body.name, '$options': 'i'  }});
		var venue_types_ids = [];
		venue_types.forEach(function(type) { venue_types_ids.push(type._id.toString()) });

		// initiate search object
		var searchQuery = {};
		searchQuery.type = 'venues';
		searchQuery.published = 1;
		searchQuery.status = true;
		searchQuery.$or = [
			{"name" : { '$regex' : req.body.name, '$options': 'i'  }},
			{"venue_types": {$in : venue_types_ids}}
		];
		if(req.body.capacity != ''){
			searchQuery.capacity = { $lte: req.body.capacity }
		}

		// Now, search into restaurant
		var restaurants = await Restaurant.find(searchQuery);
		SearchLog.create({search:req.body.name,createdAt:new Date()});
		restaurants.forEach(function(restaurant) { db.collection('statistics').insertOne({restaurant_id:restaurant._id,type:'impression',createdAt:new Date()}) });
		await Restaurant.updateOne(
			searchQuery,
			{ 
				$inc: { impressions: 1 } 
			}
		);

		// Finally, search for image of that restaurant
		restaurants = JSON.parse(JSON.stringify(restaurants));
		await Promise.all(restaurants.map(async (restaurant, index) => {
			var images = await RestaurantImage.find({restaurant_id: restaurant._id});
			images = JSON.parse(JSON.stringify(images));
			restaurants[index].images = images;
		}));
		
		response.restaurants = restaurants;
		response.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';

		res.json(response);
	} catch (err) {
		res.json({ error: err.message || err.toString() });
	}
});


router.post('/filterMostTrusted', async (req, res) => {
	try {
		var trusted_restaurants = await Restaurant.find(req.body);
		var response = {};

		// Finally, search for image of that restaurant
		trusted_restaurants = JSON.parse(JSON.stringify(trusted_restaurants));
		await Promise.all(trusted_restaurants.map(async (restaurant, index) => {
			var images = await RestaurantImage.find({restaurant_id: restaurant._id});
			images = JSON.parse(JSON.stringify(images));
			trusted_restaurants[index].images = images;
		}));

		response.trusted_restaurants = trusted_restaurants;
		response.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';
		res.json(response);
	} catch (err) {
		res.json({ error: err.message || err.toString() });
	}
});

router.post('/saveInterestedEmails', async (req, res) => {
	try {
		await InterestedEmail.create({email:req.body.email,createdAt:new Date()});
		res.json({status:true});
	} catch (err) {
		res.json({ error: err.message || err.toString() });
	}
});

router.post('/fetchBlogs', async (req, res) => {
	try {
		var postData = {};
		postData.city = req.body.city;
		if(req.body.type == 'restaurant'){
			postData.type = 'restaurant_bars';
		} else{
			postData.type = 'venues';
		}
		postData.number = req.body.count;
		var clientServerOptions = {
			uri: 'https://www.10ofthebest.com.au/blog/wp-blog.php',
			body: JSON.stringify(postData),
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}
		request(clientServerOptions, function (error, response) {
			res.json(JSON.parse(response.body));
		});
	} catch (err) {
		res.json({ error: err.message || err.toString() });
	}
});

module.exports = router;