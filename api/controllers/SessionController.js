/**
 * SessionController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var passport = require("passport"),
    check = require('validator').check;
//var bcrypt = require('bcrypt');

module.exports = {

  check: function(req, res) { //called on every app start or when browser is refreshed
    if(req.session.authStatus){//If authStatus is initialized then the user must be logged in
      // Let's check to see if the admin status of the user has changed in the DB
      User.findOne(req.session.authStatus.id, function foundUser(err, user){
        if(err) return res.send(500, "There was an error finding user");
        req.session.authStatus.admin = user.admin;
        //Send back the authStatus back to the browser
        res.json(req.session.authStatus);
      });        
    } else {
        res.send(401);
    }
  },
    
  create: function(req, res) {
    if(req.session.authStatus){ //if the user is signing in to another account while logged in, log out of current session first
      AuthStatusService.logout(req);
    }

    // If the authType is 'local' (i.e. '/auth/create/local') perform the passport-local strategy
    if(req.param('id') === 'local'){
      AuthStatusService.loginLocal(req, res);
    }//end local login logic              
  },

 destroy: function(req, res){
    AuthStatusService.logout(req, res);
    res.send(200);
 }
  
};
