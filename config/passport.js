// Location: /config/passport.js
var passport    = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  bcrypt = require('bcrypt'),
  check = require('validator').check;

passport.serializeUser(function(user, done) {
  done(null, user[0].id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(email, password, done) {
    User.findByEmail(email).done(function(err, user) {
      if (err) { return done(null, err); }
      if (!user || typeof user[0] === 'undefined') { return done(null, false, { message: 'Whoops! Wrong email or password. Have another go!'}); }
      bcrypt.compare(password, user[0].encryptedPassword, function(err, res) {
        if (!res) return done(null, false, { message: 'Whoops! Wrong email or password. Have another go!'}); 
        // Note we provide an identical message for both the "unregistered email' and 'wrong password' errors
        // to prevent phishers from finding out what email addresses our users signed up with simply by fiddling
        // with the login form
        return done(null, user);
      });
    });
  })
);

module.exports = {
 express: {
    customMiddleware: function(app){
      console.log('express midleware for passport');
      app.use(passport.initialize());
      app.use(passport.session());
    }
  }
};