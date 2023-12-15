const express = require('express');

const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');

const router = express.Router();

router.get('/review_count', async (req, res) => {
  try {
    Restaurant.find().then(restaurants => {
      // 1. Get all the restaurants
      restaurants = JSON.parse(JSON.stringify(restaurants));
      Promise.all(restaurants.map(async (restaurant, index) => {
        // 2. loop through all of them and fetch all the star rating count
        var one_star = await Review.find({restaurant_id:restaurant._id,rating_value:1}).countDocuments();
        var two_star = await Review.find({restaurant_id:restaurant._id,rating_value:2}).countDocuments();
        var three_star = await Review.find({restaurant_id:restaurant._id,rating_value:3}).countDocuments();
        var four_star = await Review.find({restaurant_id:restaurant._id,rating_value:4}).countDocuments();
        var five_star = await Review.find({restaurant_id:restaurant._id,rating_value:5}).countDocuments();

        // 3. now calculate total review and avg ratings
        var total_reviews = one_star + two_star + three_star + four_star + five_star;
        var avg_rating = ((one_star*1) + (two_star*2) + (three_star*3) + (four_star*4) + (five_star*5))/total_reviews;
        avg_rating = Math.round(avg_rating * 10) / 10;

        var rating = Math.round(avg_rating);

        // 4. Finally update into restarunt collection
        await Restaurant.findOneAndUpdate(
          { _id: restaurant._id },
          { $set: {rating:rating, total_reviews:total_reviews} }
        );
      }));
      res.json({status:'ok'});
    });
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/review_vote_count', async (req, res) => {
  try {
    Review.find().then(reviews => {
      // 1. Fetch all the reviews
      reviews = JSON.parse(JSON.stringify(reviews));
      Promise.all(reviews.map(async (review, index) => {
        // 2. loop through all the review and fetch helpful and not helpful ratings votes
        var helpful = await ReviewVote.find({review_id:review._id,vote:'helpful'}).countDocuments();
        var nothelpful = await ReviewVote.find({review_id:review._id,vote:'nothelpful'}).countDocuments();

        // 3. now update all count for review vote for each review below
        await Review.findOneAndUpdate(
          { _id: review._id },
          { $set: {helpful:helpful, nothelpful:nothelpful} }
        );
      }));
      res.json({status:'ok'});
    });
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;