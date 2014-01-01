/**
 * AuthController
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

// Location: /api/controllers/AuthController.js
var passport = require("passport"),
	check = require('validator').check;

module.exports = {
    
  // login: function(req,res){
  //   res.view("auth/login");
  // },

  login: function(req,res){
  	// First let's check to see if the email is valid
  	try {
    	check(req.body.username, "Please enter a valid email address").isEmail()
	} catch (e) {
		return res.send(401, e.message); 	
	}
	// If the email is valid, we can proceed with passport-local validation
    passport.authenticate('local', function(err, user, info){
      if ((err) || (!user)) { //if error, or now user found, send back an error message
        res.send(401, info.message);
        return;
      }
      req.logIn(user, function(err){
        if (err) return res.send(401);

        // Note, we use "user[0]"" rather than just "user" below because passport.js returns the user as an array with the user
    	// object embedded into the first array index.

    	//We passed authentication so lets initialize authStatus
    	AuthStatusService.initialize(req, user[0]);

    	// Let's set the user online attribute to true in DB
    	user[0].online = true;
    	User.update(user[0].id, user[0], function userOnlineStatusSaved(err, user){
    		if (err) return res.send(500, "There was an error changing user status to online");

			// Inform other sockets (i.e. connected sockets that are subscribed) that this user is now logged in
            // User.publishUpdate(user.id, {
            //         loggedIn: true, 
            //         id: user.id,
            //         name: user.name,
            //         action: ' has logged in.'
            // });

    		// If all goes well updating the user's status to online in DB then send back authStatus to client
    		console.log(req.session.authStatus);
    		res.json(req.session.authStatus);
    	});
      });
    })(req, res);
  },

  logout: function (req,res){
    req.logout(); //logout with passport

     // The user is "logging out" (e.g. destroying the session) so change the online attribute to false
     User.findOne(req.session.authStatus.id, function foundUser(err, user){
         var userId = req.session.authStatus.id;

         if(user){// Lets check to make sure the user has not been deleted by an admin immediately before clicking sign-out
                 User.update(userId, {
                         online: false
                 }, function(err) {
                         if (err) return next(err);

                        // //Inform other sockets (i.e. connected sockets that are subscribed) that this user is now logged in
                        // User.publishUpdate(user.id, {
                        //         loggedIn: false,
                        //         id: user.id,
                        //         name: user.name,
                        //         action: ' has logged out.'
                        // });
        
                         // Wipe out the session (log out)
                         req.session.destroy();
                         res.send(200);
                 });
         } else { // The user must have been deleted by an admin while logged in 
                 // Wipe out the session (log out)
                        req.session.destroy();
                        res.send(200);
         }
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthController)
   */
  _config: {}

  
};
