const passport = require('passport');
const Strategy = require('passport-facebook');
const User = require('./models/User');

function auth({ ROOT_URL, server }) {
  const verify = async (accessToken, refreshToken, profile, verified) => {
    const { email, first_name, last_name } = profile._json;
    // console.log(profile._json);
    // console.log(profile._json.picture.data.url);
    
    try {
      const user = await User.fbSignInOrSignUp({
        facebookId: profile._json.id,
        name: profile._json.name,
        avatarUrl: profile._json.picture.data.url,
        facebookToken: { accessToken, refreshToken },
      });
      verified(null, user);
    } catch (err) {
      verified(err);
      console.log(err); // eslint-disable-line
    }
  };
  passport.use(
    new Strategy(
      {
        clientID: process.env.Facebook_clientID,
        clientSecret: process.env.Facebook_clientSecret,
        callbackURL: process.env.SITE_URL+'/auth/facebook/callback',
        graphAPIVersion: "v4.0",
        profileFields: ['id', 'displayName', 'photos', 'email']
      },
      verify,
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, User.publicFields(), (err, user) => {
      done(err, user);
    });
  });

  server.use(passport.initialize());
  server.use(passport.session());

  server.get('/auth/facebook', (req, res, next) => {
    const options = {
      prompt: 'select_account',
    };

    if (req.query && req.query.redirectUrl && req.query.redirectUrl.startsWith('/')) {
      req.session.finalUrl = req.query.redirectUrl;
    } else {
      req.session.finalUrl = null;
    }
    passport.authenticate('facebook', options)(req, res, next);
  });

  server.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      if (req.user && req.user.isAdmin) {
        res.redirect('/admin');
      } else if (req.session.finalUrl) {
        res.redirect(req.session.finalUrl);
      } else {
        res.redirect('/');
      }
    },
  );

  server.get('/logout', (req, res) => {
    req.logout();

    res.redirect(req.get('referer'));
  });
}

module.exports = auth;
