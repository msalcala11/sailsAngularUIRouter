exports.initialize = function(req, res, user) { //used for initializing the authStatus session object on login or new user creation

    req.session.authStatus = {
                                    loggedIn: true,
                                    admin: false,
                                    name: user.name, //its useful to have their name for display in navbar
                                    id: user.id,  
                                    pic: user.facebook_profile_pic
                                 }
    if(user.admin){ //If the user is an admin, update their authStatus to reflect this
    	req.session.authStatus.admin = true;
    }

    // Let's set the user online attribute to true in DB
    user.online = true;
    User.update(user.id, user, function userOnlineStatusSaved(err, updatedUser){
        if (err) return res.send(500, "There was an error changing user status to online");

          console.log("about to publishUpdate. here is the user");
          console.log(updatedUser[0]);

          //Inform other sockets (i.e. connected sockets that are subscribed) that this user is now logged in
          User.publishUpdate(updatedUser[0].id, {
                  loggedIn: true, 
                  id: updatedUser[0].id,
                  name: updatedUser[0].name,
                  action: ' has logged in.'
          });

        // If all goes well updating the user's status to online in DB then send back authStatus to client
        console.log(req.session.authStatus);
        res.json(req.session.authStatus);
    });
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
        console.log("local login user:")
        console.log(user);
        req.logIn(user, function(err){
          if (err) return res.send(401);

            // Note, we use "user[0]"" rather than just "user" below because passport.js returns the user as an array with the user
            // object embedded into the first array index.

            //We passed authentication so lets initialize authStatus
            AuthStatusService.initialize(req, res, user[0]);
        });
      })(req, res);
};

// Note the logout function does NOT send a 200 upon completion so that we can reuse it for logins
// when the user is logged into one account, and while logged in, logs into another. This means
// you must send the 200 yourself.
exports.logout = function(req) {
    console.log(req.session.authStatus);
    if(req.session.authStatus){ //if the server was restarted and thus authStatus was deleted, then just send a 200 after calling this
    	req.logout(); //logout with passport

         // The user is "logging out" (e.g. destroying the session) so change the online attribute to false
        User.findOne(req.session.authStatus.id, function foundUser(err, user){
             var userId = req.session.authStatus.id;

             console.log("about to unsubscribe");
             //User.unsubscribe(req.socket);
             //User.unsubscribe(req.socket, user);

             if(user){// Lets check to make sure the user has not been deleted by an admin immediately before clicking sign-out
                     User.update(userId, {
                             online: false
                     }, function(err) {
                             if (err) return res.send(500, "Error while updating user online status in database.");


                            //Inform other sockets (i.e. connected sockets that are subscribed) that this user is now logged in
                            User.publishUpdate(user.id, {
                                    loggedIn: false,
                                    id: user.id,
                                    name: user.name,
                                    action: ' has logged out.'
                            });
            
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
    }//end if(req.session)
   //if the server was restarted and the session was deleted, then just send a 200 after calling this
};


