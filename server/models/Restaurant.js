const mongoose = require('mongoose');
var db = mongoose.connection;
const _ = require('lodash');
const generateSlug = require('../utils/slugify');
const sendEmail = require('../mail');
const { siteURL } = require('../env');
// const { getEmailTemplate } = require('./EmailTemplate');
const logger = require('../logs');

const Event = require('./Event');
const Misc = require('./Misc');
const SliderImage = require('./SliderImage');
const Menu = require('./Menu');
const Faq = require('./Faq');
const Package = require('./Package');

const { Schema } = mongoose;

const mongoSchema = new Schema({
  
},{ strict: false });

class RestaurantClass {
  static publicFields() {
    return [
      'id'
    ];
  }

  static async add({ username, email, password}) {
    return this.create({
      username,
      email,
      password,
      createdAt: new Date(),
    });
  }

  static async getDetails({ slug }) {
    var restaurant = await this.findOne({ slug: slug });
    if(restaurant){
      // 1. Convert format
      var restaurant = JSON.parse(JSON.stringify(restaurant));

      // 2. Fetch Restaurant Types and Replace into master Array
      restaurant.restaurant_types = await Misc.find({group:'restaurant-bars',type:'dinetype',_id: {"$in":restaurant.restaurant_types}});

      // 3. Fetch Payment Methods details and Replace into master Array
      restaurant.payment_methods = await Misc.find({group:'general',type:'paymentMethod',_id: {"$in":restaurant.payment_methods}});

      // 4. Fetch Cuisine Types and Replace into master Array
      restaurant.cuisine_types = await Misc.find({group:'restaurant-bars',type:'cuisinetype',_id: {"$in":restaurant.cuisine_types}});

      // 5. Fetch Restaurant Features and Replace into master Array
      restaurant.features = await Misc.find({group:'restaurant-bars',type:'feature',_id: {"$in":restaurant.features}});

      // 7. Fetch Menu
      var menu = {};
      var categories = await Menu.find({parent:0,restaurant_id:restaurant._id});
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
      restaurant.menu = menu;

      // 8. Fetch FAQ
      var faqs = await Faq.find({parent:restaurant._id});
      restaurant.faqs = JSON.parse(JSON.stringify(faqs)); 

      // 9. Fetch Slider images
      const images = await SliderImage.find({restaurant_id: restaurant._id});
      restaurant.slider_images = images;
      restaurant.slider_url = process.env.ADMIN_URL + '/static/slider_images/';
      restaurant.slider_thumb_url = process.env.ADMIN_URL + '/static/slider_thumb/';

      // 10. increment clicks
      db.collection('statistics').insertOne({restaurant_id:restaurant._id,type:'click',createdAt:new Date()});
      await this.updateOne(
        { slug: restaurant.slug },
        { $inc: { clicks: 1 } }
      );

      // 11. Fetch Plan details and based on it show/hide value
      restaurant.plandetails = {};
      var events = [];
      if(restaurant.plan != undefined){
        var plandetails = await Package.getDetails({id:restaurant.plan});
        plandetails = JSON.parse(JSON.stringify(plandetails));
        if(plandetails.Social_Media == 'N'){
          restaurant.facebook = '';
          restaurant.twitter = '';
          restaurant.instagram = '';
        }
        if(plandetails.Website_Link == 'N'){
          restaurant.website = '';
        }
        if(plandetails.Event == 'N' || plandetails.Event == '0' || isNaN(parseInt(plandetails.Event))){
          // do nothing
        } else{
          var events = await Event.find({parent:restaurant._id}).sort({"createdAt":-1}).limit(parseInt(plandetails.Event));
        }
        restaurant.events = JSON.parse(JSON.stringify(events));
        restaurant.event_image = process.env.ADMIN_URL + '/static/event_image/';

        restaurant.plandetails = plandetails;
      } else{
        restaurant.facebook = '';
        restaurant.twitter = '';
        restaurant.instagram = '';
        restaurant.website = '';
      }

      return restaurant;
    } else{
      return false;
    }
  }
}

mongoSchema.loadClass(RestaurantClass);

const Restaurant = mongoose.model('Restaurant', mongoSchema);

module.exports = Restaurant;
