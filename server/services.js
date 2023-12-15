const Misc = require('./models/Misc');
const Restaurant = require('./models/Restaurant');

const search = async function search(options) {
    if(options.name == undefined){

    } else{
        var restaurant_types = await Misc.find({group:'restaurant-bars',type:'dinetype',name:{ '$regex' : options.name, '$options': 'i'  }});
        var restaurant_types_ids = [];
        restaurant_types.forEach(function(type) { restaurant_types_ids.push(type._id.toString()) });

        var restaurant_cuisines = await Misc.find({group:'restaurant-bars',type:'cuisinetype',name:{ '$regex' : options.name, '$options': 'i'  }});
        var restaurant_cuisines_ids = [];
        restaurant_cuisines.forEach(function(type) { restaurant_cuisines_ids.push(type._id.toString()) });

        var restaurant_features = await Misc.find({group:'restaurant-bars',type:'feature',name:{ '$regex' : options.name, '$options': 'i'  }});
        var restaurant_features_ids = [];
        restaurant_features.forEach(function(type) { restaurant_features_ids.push(type._id.toString()) });
    }

    // Now, search into restaurant
    var restaurant_search = {};
    if(options.name != undefined){
        restaurant_search.$or = [
            {"name" : { '$regex' : options.name, '$options': 'i'  }},
            {"restaurant_types": {$in : restaurant_types_ids}},
            {"cuisine_types": {$in : restaurant_cuisines_ids}},
            {"features": {$in : restaurant_features_ids}}
        ];
    }
    if(options.location != undefined && options.location.length > 0){
        restaurant_search.city = {$in : options.location};
    }
    if(options.cuisine != undefined && options.cuisine.length > 0){
        restaurant_search.cuisine_types = {$in : options.cuisine};
    }
    restaurant_search.city = {$regex : options.city, $options : 'i'};
    restaurant_search.type = options.type;
    restaurant_search.published = 1;
    restaurant_search.status = true;
    var restaurants = await Restaurant.find(restaurant_search);
    return restaurants;
}

module.exports = {search:search};