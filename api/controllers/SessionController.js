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

var bcrypt = require('bcrypt');

module.exports = {

  check: function(req, res) { //called on every app start or browser refresh
    if(req.session.authStatus){
        if(req.session.authStatus.loggedIn){//multilayered if statement to prevent undefined error if authStatus has not been initialized
            res.json(req.session.authStatus);
        }
    } else {
        res.send(401);
    }
  },
    
  create: function(req, res) {

                 //Lets check to see if the user entered something for both the email and password fields
                 if(!req.param('email') || !req.param('password')){
                         var usernamePasswordRequiredError = {name: 'usernamePasswordRequired', message: 'Please enter both a username and password.'};
                         res.statusCode = 401;
                         res.json(usernamePasswordRequiredError);
                         return;
                 }

                 //Lets check to see if the email entered exists in the database
                 User.findOneByEmail(req.param('email')).done( function(err, user){
                         if (err) return next(err);

                         if(!user){
                                 var noUserFoundError = {name: 'noUserFound', message: req.param('email') + ' is not associated with an existing account.'};
                                 res.statusCode = 401;
                                 res.json(noUserFoundError);   
                                 return;
                         }

                         console.log(user.email);
                         //Lets check to see if the password is correct
                         bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid) {
                                 if (err) return next(err);

                                 if(!valid){
                                         var wrongPasswordError = {name: "wrongPasswordError", message: "Hmm, it looks like you may have mistyped your password. Have another go!"};
                                         res.statusCode = 401;
                                         res.json(wrongPasswordError);
                                         return;
                                 }

                                 // Let's authenticate them
                                 // req.session.authStatus = {
                                 //    loggedIn: true,
                                 //    admin: false,
                                 //    name: user.name, //its useful to have their name for display in navbar
                                 //    id: user.id,  
                                 // }

                                 AuthStatusService.initialize(req, user);

                                 req.session.User = user;

                                 // Change user status to online
                                 user.online = true;
                                 user.save(function(err, user) {
                                        if (err) return next(err);

                                        // //Inform other sockets (i.e. connected sockets that are subscribed) that this user is now logged in
                                        // User.publishUpdate(user.id, {
                                        //         loggedIn: true, 
                                        //         id: user.id,
                                        //         name: user.name,
                                        //         action: ' has logged in.'
                                        // });

                                        // If the user is an admin, update their authStatus to reflect this
                                         if(req.session.User.admin) {
                                            req.session.authStatus.admin = true;
                                         }

                                         //Send back their authStatus (including their role)
                                         res.json(req.session.authStatus);
                                 });                
        
                         });
                 });
         },

         destroy: function(req, res){

                 User.findOne(req.session.User.id, function foundUser(err, user){
                         var userId = req.session.User.id;

                         if(user){// Lets check to make sure the user has not been deleted by an admin immediately before clicking sign-out
                                 // The user is "logging out" (e.g. destroying the session) so change the online attribute to false
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
        }
  
};
