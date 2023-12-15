const Restaurant = require('./models/Restaurant');
const Event = require('./models/Event');
const Misc = require('./models/Misc');
const SliderImage = require('./models/SliderImage');
const Review = require('./models/Review');
const RestaurantImage = require('./models/RestaurantImage');
const PageTemplate = require('./models/PageTemplate');
const Menu = require('./models/Menu');
const Faq = require('./models/Faq');
const User = require('./models/User');
const LRUCache = require('lru-cache');
const async = require('async');
const cities = require('../pages/au.json');
const { exec } = require('child_process');
const {search} = require('./services');

module.exports = function({ server, app }){
  const handle = app.getRequestHandler();
  const ssrCache = new LRUCache({
    max: 100, // 100 items
    maxAge: 1000 * 60 * 60, // 1 hr
  });

  function getCacheKey(req) {
    if (req.user) {
      return `${req.url}${req.user.id}`;
    }
    return `${req.url}`;
  }

  async function renderAndCache(req, res, pagePath, queryParams) {
    const key = getCacheKey(req);

    // If we have a page in the cache, let's serve it
    if (ssrCache.has(key)) {
      res.setHeader('x-cache', 'HIT');
      res.send(ssrCache.get(key));
      return;
    }

    try {
      // If not let's render the page into HTML
      const html = await app.renderToHTML(req, res, pagePath, queryParams);

      // Something is wrong with the request, let's skip the cache
      if (res.statusCode !== 200) {
        res.send(html);
        return;
      }

      // Let's cache this page
      ssrCache.set(key, html);

      res.setHeader('x-cache', 'MISS');
      res.send(html);
    } catch (err) {
      app.renderError(err, req, res, pagePath, queryParams);
    }
  }

  server.get('/clearcache', (req, res) => {
    ssrCache.reset();
    res.status(200).send('Cached cleared!');
  });

  // server.get('/resetcache', (req, res) => {
  //   ssrCache.reset();
  //   exec('wget --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36" "https://www.10ofthebest.com.au/melbourne"');
  //   exec('wget --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36" "https://www.10ofthebest.com.au/sydney"');
  //   exec('wget --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36" "https://www.10ofthebest.com.au/adelaide"');
  //   exec('wget --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36" "https://www.10ofthebest.com.au/perth"');
  //   exec('wget --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36" "https://www.10ofthebest.com.au/brisbane"');
  //   res.status(200).send('Cached reset!');
  // });

  server.get('/for-restaurant-owners', (req, res) => {
    app.render(req, res, '/landingpage-for-venue-owners');
  });

  server.get('/robots.txt', (req, res) => {
    if(process.env.PLATFORM == 'PROD'){
      res.type('text/plain')
      res.send("User-agent: *\nAllow: /\nDisallow: /blog/wp-login.php\nDisallow: /blog/wp-admin/\nAllow: /blog/wp-admin/admin-ajax.php\n\nSitemap: https://www.10ofthebest.com.au/sitemap.xml");
    } else{
      res.type('text/plain')
      res.send("User-agent: *\ndisallow: /");
    }
  });

  server.get('/profile', (req, res) => {
    app.render(req, res, '/profile');
  });

  server.get('/thank-you', (req, res) => {
    app.render(req, res, '/thank-you');
  });

  server.get('/listing/:city', async (req, res) => {
    // If we have a page in the cache, let's serve it
    const key = getCacheKey(req);
    if (ssrCache.has(key)) {
      res.send(ssrCache.get(key));
      return;
    }

    if(cities.some(el => el.city.toLowerCase().replace(/ /g,"-") === req.params.city)){
      // Do nothing if City is valid
    } else{
      // show 404
      app.render(req, res, '/404');
      return false;
    }

    var city = req.params.city;
    // 1. Fetch restaurnts
    var type = req.query.t == 'restaurant' ? 'restaurant_bars' : 'venues';
    // Prepare vars and call search service
    const { q } = req.query;
    const options = {name:q, type, location:'', cuisine:'', city};
    var restaurants = await search(options);

    // 2. Convert format
    restaurants = JSON.parse(JSON.stringify(restaurants));

    // 3. Fetch Cuisine Types and Replace into master Array
    await Promise.all(restaurants.map(async (restaurant, index) => {
      // Fetch images
      var images = await RestaurantImage.find({restaurant_id: restaurant._id});
      images = JSON.parse(JSON.stringify(images));
      restaurants[index].images = images;

      // Fetch cuisine types
      var cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});
      restaurants[index].cuisine_types = cuisine_types;

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
      restaurants[index].avg_review = avg_review;
      restaurants[index].total_rating = total_rating;
    }));

    var cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype'});
    var image_url = process.env.ADMIN_URL + '/static/restaurant_images/';
    // Let's cache this page
    const html = await app.renderToHTML(req, res, '/listing', {restaurants:restaurants,filterRestaurants:restaurants, query:req.query, image_url:image_url, cuisine_types:cuisine_types});
    ssrCache.set(key, html);
    res.send(html);
  });

  server.get('/event/:id', async (req, res) => {
    // If we have a page in the cache, let's serve it
    const key = getCacheKey(req);
    if (ssrCache.has(key)) {
      res.setHeader('x-cache', 'HIT');
      res.send(ssrCache.get(key));
      return;
    }

    // Get event id from the URL
    var event_id = req.params.id;

    // Get event details
    var event = await Event.findOne({ _id: event_id });
    event = JSON.parse(JSON.stringify(event));
    // Check if event found or not. If not then display 404
    if(event){
      var restaurant = await Restaurant.findOne({_id: event.parent});
      restaurant = JSON.parse(JSON.stringify(restaurant));
      var event_image = process.env.ADMIN_URL + '/static/event_image/';
      // Let's cache this page
      const html = await app.renderToHTML(req, res, '/event-details', {event, restaurant, event_image});
      ssrCache.set(key, html);
      res.setHeader('x-cache', 'MISS');
      res.send(html);
    } else{
      app.render(req, res, '/404');
    }
  });

  server.get('/reset-password/:reset_token', async (req, res) => {
    var reset_token = req.params.reset_token;
    app.render(req, res, '/reset-password', {reset_token});
  });

  server.get('/verify-email/:verify_token', async (req, res) => {
    var user = await User.findOne({verify_token: req.params.verify_token});
    if(user){
      await User.updateOne({verify_token: req.params.verify_token},{verify_token:null,verified:true,email_verified:true},{multi:true});
    }
    res.redirect('/');
  });

  server.get('/', async (req, res) => {
    var pagetemplates = {};
    pagetemplates.restaurant_bars_templates = [];
    pagetemplates.venues_templates = [];

    var trusted_restaurants = {};
    trusted_restaurants.restaurants = [];
    var trusted_venues = trusted_restaurants;
    trusted_restaurants.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';

    app.render(req, res, '/index', {pagetemplates:pagetemplates, trusted_restaurants:trusted_restaurants, trusted_venues:trusted_venues, city:false});
  });

  server.get('/:city', async (req, res) => {
    // If we have a page in the cache, let's serve it
    const key = getCacheKey(req);
    if (ssrCache.has(key)) {
      // res.setHeader('x-cache', 'HIT');
      res.send(ssrCache.get(key));
      return;
    }
    if(cities.some(el => el.city.toLowerCase().replace(/ /g,"-") === req.params.city)){
      // Do nothing if City is valid
    } else{
      // show 404
      app.render(req, res, '/404');
      // res.send(html);
      return false;
    }

    var city = req.params.city;
    async.parallel({
      restaurant_bars_templates: function(callback) {
        PageTemplate.find({city:{ '$regex' : city, '$options': 'i'  },type:'restaurant_bars'}).then(restaurant_bars_templates => {
          callback(null, restaurant_bars_templates);
        });
      },
      venues_templates: function(callback) {
        PageTemplate.find({city:{ '$regex' : city, '$options': 'i'  },type:'venues'}).then(venues_templates => {
          callback(null, venues_templates);
        });
      },
      trusted_venues: function(callback) {
        var trusted_venues = {};
        Restaurant.find({deletedAt:null,status:true,published:1,trusted:true,city:{ '$regex' : city, '$options': 'i'},type:'venues'}).then(venues => {
          // Finally, search for image of that restaurant
          venues = JSON.parse(JSON.stringify(venues));
          Promise.all(venues.map(async (venue, index) => {
            return RestaurantImage.find({restaurant_id: venue._id}).then(images => {
              images = JSON.parse(JSON.stringify(images));
              venues[index].images = images;
              return venues;
            });
          })).then(async function(result) {
            if(result.length > 0){
              venues = result[0];
            } else{
              venues = [];
            }
            trusted_venues.venues = venues;
            trusted_venues.image_url = process.env.ADMIN_URL + '/static/restaurant_images/';
            callback(null, trusted_venues);
          });
        });
      },
      trusted_restaurants: function(callback) {
        var trusted_restaurants = {};
        Restaurant.find({deletedAt:null,status:true,published:1,trusted:true,city:{ '$regex' : city, '$options': 'i'},type:'restaurant_bars'}).then(restaurants => {
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
            trusted_restaurants.restaurants = restaurants;
            callback(null, trusted_restaurants);
          });
        });
      },
    }, async function(err, results) {
      // results is now equals to: {one: 1, two: 2}
      var pagetemplates = {};
      pagetemplates.restaurant_bars_templates = results.restaurant_bars_templates;
      pagetemplates.venues_templates = results.venues_templates;
      app.render(req, res, '/index', {pagetemplates:pagetemplates, trusted_restaurants:results.trusted_restaurants,trusted_venues:results.trusted_venues, city_capital:city.replace(/-/g," ").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}), city:city.toLowerCase().replace(/ /g,"-")});
      // ssrCache.set(key, html);
      // res.setHeader('x-cache', 'MISS');
      // res.send(html);
    });
  });

  server.get('/preview/:slug', async (req, res) => {
    var slug = req.params.slug;
    var restaurant = await Restaurant.findOne({ slug: slug });
    if(restaurant){
      // 1. Convert format
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

      // 6. Fetch Events
      var events = await Event.find({parent:restaurant._id});
      events = JSON.parse(JSON.stringify(events));
      restaurant.events = events;
      restaurant.event_image = process.env.ADMIN_URL + '/static/event_image/';

      // 7. Fetch Menu
      var menu = {};
      var categories = await Menu.find({parent:0,restaurant_id:restaurant._id});
      categories = JSON.parse(JSON.stringify(categories));

      // 8. Fetch FAQ
      var faqs = await Faq.find({parent:restaurant._id});
      faqs = JSON.parse(JSON.stringify(faqs)); 
      restaurant.faqs = faqs;

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
      restaurant.menu = menu;

      // 8. Fetch Slider images
      const images = await SliderImage.find({restaurant_id: restaurant._id});
      restaurant.slider_images = images;
      restaurant.slider_url = process.env.ADMIN_URL + '/static/slider_images/';
      restaurant.slider_thumb_url = process.env.ADMIN_URL + '/static/slider_thumb/';

      if(restaurant.type == 'restaurant_bars'){
        app.render(req, res, '/restaurant-details-preview', {slug, restaurant});
        // ssrCache.reset();
        // renderAndCache(req, res, '/restaurant-details-preview', {slug, restaurant});
      } else if(restaurant.type == 'venues'){
        app.render(req, res, '/venue-details-preview', {slug, restaurant});
        // ssrCache.reset();
        // renderAndCache(req, res, '/venue-details-preview', {slug, restaurant});
      }
    } else{
      app.render(req, res, '/404');
    }
  });

  server.get('/:city/:slug', async (req, res) => {
    if(cities.some(el => el.city.toLowerCase().replace(/ /g,"-") === req.params.city)){
      // Do nothing if City is valid
    } else{
      // show 404
      app.render(req, res, '/404');
      // res.send(html);
      return false;
    }
    var city = req.params.city;
    if(city != city.toLowerCase()){
      res.redirect('/'+city.toLowerCase()+'/'+req.params.slug);
    }
    // If we have a page in the cache, let's serve it
    const key = getCacheKey(req);
    if (ssrCache.has(key)) {
      res.setHeader('x-cache', 'HIT');
      res.send(ssrCache.get(key));
      return;
    }

    var slug = req.params.slug;
    var restaurant = await Restaurant.getDetails({slug: slug});
    if(restaurant){
      if(restaurant.type == 'restaurant_bars'){
        // Let's cache this page
        const html = await app.renderToHTML(req, res, '/restaurant-details', {slug, restaurant});
        ssrCache.set(key, html);res.setHeader('x-cache', 'MISS');res.send(html);
      } else if(restaurant.type == 'venues'){
        // Let's cache this page
        const html = await app.renderToHTML(req, res, '/venue-details', {slug, restaurant});
        ssrCache.set(key, html);res.setHeader('x-cache', 'MISS');res.send(html);
      }
    } else{
      app.render(req, res, '/404');
    }
  });

  server.get('/:city/collection/:slug', async (req, res) => {
    if(cities.some(el => el.city.toLowerCase().replace(/ /g,"-") === req.params.city)){
      // Do nothing if City is valid
    } else{
      // show 404
      app.render(req, res, '/404');
      return false;
    }
    // If we have a page in the cache, let's serve it
    const key = getCacheKey(req);
    if (ssrCache.has(key)) {
      res.send(ssrCache.get(key));
      return;
    }

    var slug = req.params.slug;
    var collection = await PageTemplate.findOne({ slug: slug });
    if(collection){
      // Convert format
      var collection = JSON.parse(JSON.stringify(collection));
      // Template Image URL
      var template_image_url = process.env.ADMIN_URL + '/static/template_images/';
      // Fetch Restaurants
      var restaurants = await Restaurant.find({_id: {"$in":collection.restaurants}});
      var restaurants = JSON.parse(JSON.stringify(restaurants));
      // Fetch Restaurant Details
      await Promise.all(restaurants.map(async (restaurant, index) => {
        // Fetch images
        var images = await RestaurantImage.find({restaurant_id: restaurant._id});
        images = JSON.parse(JSON.stringify(images));
        restaurants[index].images = images;

        // Fetch cuisine types
        var cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});
        restaurants[index].cuisine_types = cuisine_types;

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
        restaurants[index].avg_review = avg_review;
        restaurants[index].total_rating = total_rating;
      }));

      var restaurant_image_url = process.env.ADMIN_URL + '/static/restaurant_images/';

      // Let's cache this page
      const html = await app.renderToHTML(req, res, '/landing-page', {slug, collection, template_image_url, restaurants, restaurant_image_url});
      ssrCache.set(key, html);
      res.send(html);
    } else{
      app.render(req, res, '/404');
    }
  });

  const URL_MAP = {

  };

  server.get('*', (req, res) => {
    const url = URL_MAP[req.path];
    if (url) {
      app.render(req, res, url);
    } else {
      handle(req, res);
    }
  });
}