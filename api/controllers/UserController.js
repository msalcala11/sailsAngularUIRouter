/**
 * UserController
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

module.exports = {

	create: function (req, res, next){
		User.create(req.params.all(), function(err, user) {
			if(err) {
				res.send(500);
			} else {
				// Let's authenticate them
				// req.session.authStatus = {
				// 	loggedIn: true,
				// 	admin: false,
				// 	name: user.name,
				// 	id: user.id,
				// }

				// Let's log them in
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
			}
		});
	}
  
};
