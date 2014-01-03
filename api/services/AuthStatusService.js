exports.initialize = function(req, user) { //used for initializing the authStatus session object on login or new user creation

    req.session.authStatus = {
                                    loggedIn: true,
                                    admin: false,
                                    name: user.name, //its useful to have their name for display in navbar
                                    id: user.id,  
                                 }
    if(user.admin){ //If the user is an admin, update their authStatus to reflect this
    	req.session.authStatus.admin = true;
    }
};

// The loginLocal method is used to login with an email and password
exports.loginLocal = function(req, res) { 
	var passport = require("passport"),
    check = require('validator').check;
// First let's check to see if the email is valid
      try {
      	console.log(req.body.email)
        check(req.body.email, "Please enter a valid email address").isEmail()
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
};

exports.logout = function(req) {

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
                         return;
                         //res.send(200);
                 });
         } else { // The user must have been deleted by an admin while logged in 
                 // Wipe out the session (log out)
                        req.session.destroy();
                        return;
                        //res.send(200);
         }
    });
};

// Note the logout function does NOT send a 200 upon completion so that we can reuse it for logins
// when the user is logged into one account, and while logged in, logs into another. This means
// you must send the 200 yourself.
exports.logout = function(req, res) { 
	req.logout(); //logout with passport

     // The user is "logging out" (e.g. destroying the session) so change the online attribute to false
    User.findOne(req.session.authStatus.id, function foundUser(err, user){
         var userId = req.session.authStatus.id;

         if(user){// Lets check to make sure the user has not been deleted by an admin immediately before clicking sign-out
                 User.update(userId, {
                         online: false
                 }, function(err) {
                         if (err) return res.send(500, "Error while updating user online status in database.");

                        // //Inform other sockets (i.e. connected sockets that are subscribed) that this user is now logged in
                        // User.publishUpdate(user.id, {
                        //         loggedIn: false,
                        //         id: user.id,
                        //         name: user.name,
                        //         action: ' has logged out.'
                        // });
        
                         // Wipe out the session (log out)
                         req.session.destroy();
                         return;
                         //res.send(200);
                 });
         } else { // The user must have been deleted by an admin while logged in 
                 // Wipe out the session (log out)
                        req.session.destroy();
                        return;
                        //res.send(200);
         }
    });
};