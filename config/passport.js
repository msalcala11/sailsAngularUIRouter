// Location: /config/passport.js
var passport    = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy
  bcrypt = require('bcrypt'),
  check = require('validator').check;

if(!process.env.DB_NAME){ //We are not on heroku so require our local config
  var local = require('../config/local.js');
}

passport.serializeUser(function(user, done) {
  done(null, user[0].id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
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

var verifyHandlerFacebook = function (token, tokenSecret, profile, done) {
    process.nextTick(function () {
      console.log(profile.photos);
        User.findOne(
                {
                    or : [
                            {facebook_uid: parseInt(profile.id)}, 
                            {facebook_uid: profile.id},
                            {email: profile.emails[0].value}
                        ]
                }
            ).done(function (err, user) {

            if (user) {
              // If we find a user, lets update their account with the latest info from facebook, in case they
              // have made any changes.
              user.facebook_uid = profile.id + "";
              user.name = profile.displayName;
              user.facebook_profile_pic = profile.photos[0].value;
              user.save(function userSaved (err) {
                return done(null, user);
              });
            } else {
                User.create({
                    facebook_uid: profile.id + "",
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    facebook_profile_pic: profile.photos[0].value
                }).done(function (err, user) {
                    console.log(user);
                        return done(err, user);
                    });
            }
        });
    });
};

module.exports = {
 express: {
    customMiddleware: function(app){
      console.log('express midleware for passport');

      if(local){ //If module.exports.local is defined, we are on localhost
        var fb_clientID = local.facebook.clientID;
        var fb_clientSecret = local.facebook.clientSecret;
        var fb_callbackURL = local.facebook.callbackURL;
      } else {//We are on heroku
        var fb_clientID = process.env.FB_CLIENTID;
        var fb_clientSecret = process.env.FB_CLIENTSECRET;
        var fb_callbackURL = process.env.FB_CALLBACKURL;
      }

      passport.use(new FacebookStrategy({
                    clientID: fb_clientID,
                    clientSecret: fb_clientSecret,
                    callbackURL: fb_callbackURL,
                    profileFields: ['id', 'displayName', 'provider', 'photos', 'emails']
                },
                verifyHandlerFacebook
      ));

      app.use(passport.initialize());
      app.use(passport.session());
    }
  }
};