function api(server) {
  server.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  server.use('/api/v1/auth', require('./auth'));
  server.use('/api/v1/restaurant', require('./restaurant'));
  server.use('/api/v1/user', require('./user'));
  server.use('/api/v1/list', require('./list'));
  server.use('/api/v1/home', require('./home'));
  server.use('/api/v1/contact', require('./contact'));
  server.use('/api/v1/cron', require('./cron'));

  server.use('/api/app/auth', require('./app/auth'));
  server.use('/api/app/account', require('./app/account'));
  server.use('/api/app/home', require('./app/home'));
  server.use('/api/app/search', require('./app/search'));
}

module.exports = api;