const sm = require('sitemap');
const path = require('path');
const Restaurant = require('./models/Restaurant');
const PageTemplate = require('./models/PageTemplate');

require('dotenv').config();

const sitemap = sm.createSitemap({
  hostname: process.env.SITE_URL,
  cacheTime: 6000000, // 6000 sec - cache purge period
});

function setup({ server }) {
  Restaurant.find({deletedAt:null,status:true,published:1}, {slug:1,city:1}).then((restaurants) => {
    restaurants.forEach((restaurant) => {
      restaurant = JSON.parse(JSON.stringify(restaurant));
      if(restaurant.city){
        sitemap.add({
          url: '/'+restaurant.city.toLowerCase().replace(/ /g,"-")+'/'+restaurant.slug,
          changefreq: 'daily',
          priority: 1,
        });
      }
    });
  });

  PageTemplate.find({}, {slug:1,city:1}).then((collections) => {
    collections.forEach((collection) => {
      collection = JSON.parse(JSON.stringify(collection));
      if(collection.city){
        sitemap.add({
          url: '/'+collection.city.toLowerCase().replace(/ /g,"-")+'/collection/'+collection.slug,
          changefreq: 'daily',
          priority: 1,
        });
      }
    });
  });

  sitemap.add({
    url: '/sydney',
    changefreq: 'daily',
    priority: 1,
  });

  sitemap.add({
    url: '/melbourne',
    changefreq: 'daily',
    priority: 1,
  });

  sitemap.add({
    url: '/brisbane',
    changefreq: 'daily',
    priority: 1,
  });

  sitemap.add({
    url: '/perth',
    changefreq: 'daily',
    priority: 1,
  });

  sitemap.add({
    url: '/adelaide',
    changefreq: 'daily',
    priority: 1,
  });

  sitemap.add({
    url: '/about',
    changefreq: 'daily',
    priority: 1,
  });

  sitemap.add({
    url: '/help',
    changefreq: 'daily',
    priority: 1,
  });

  sitemap.add({
    url: '/contact',
    changefreq: 'daily',
    priority: 1,
  });

  server.get('/sitemap.xml', (req, res) => {
    sitemap.toXML((err, xml) => {
      if (err) {
        res.status(500).end();
        return;
      }

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    });
  });

  // server.get('/robots.txt', (req, res) => {
  //   res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
  // });
}

module.exports = setup;
