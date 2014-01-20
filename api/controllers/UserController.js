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

rmdir = require('rimraf'); //allows us to remove directories recursively


module.exports = {

	index: function (req, res, next) {
		User.find(function foundUsers (err, users) {
			if(err) return res.send(500, "Could not retrieve list of users from database.");
			else res.json(users);
		});
	},

	destroy: function (req, res, next) {
		User.destroy(req.param('id'), function(err){
			if(err) res.send(500)
			else{
				// Let's remove the user's files (i.e. '/userfiles/54')
				rmdir('userfiles/'+req.param('id'), function(error){
					if(err) console.log(err);
					User.publishDestroy(req.param('id'));
					// If the user is deleting himself, log em out
					console.log(req.session.authStatus.id)
					console.log(req.param('id'))
					if(req.session.authStatus.id == req.param('id')){
						AuthStatusService.logout(req, res);
					    res.send(200);
					}
				});
			}
		});
	},

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
				AuthStatusService.initialize(req, res, user);

				req.session.User = user;

				// Change user status to online
				user.online = true;
				user.save(function(err, user) {
				    if (err) return next(err);

					User.publishCreate(user);

				    // If the user is an admin, update their authStatus to reflect this
				     if(req.session.User.admin) {
				        req.session.authStatus.admin = true;
				     }

				     //Send back their authStatus (including their role)
				     res.json(req.session.authStatus);
				});                
			}
		});
	},

	// This is for integration with socket.io for real-time updates to changes in users
	subscribe: function(req, res, next) {
		
		User.find(function foundUsers(err, users){
			if(err) return console.log(err);
			// Let's subscribe to the model class room so we can listen for the creation of new users via publishCreate
			User.subscribe(req.socket);

			// Let's also subscribe the existing users to the model instance room so we can listen for changes 
			// to the existing users via publishUpdate and publishDestroy
			User.subscribe(req.socket, users);

			console.log("subscribe called")

			res.send(200);	
		});
	},

	// This is for integration with socket.io for real-time updates to changes in users
	subscribe: function(req, res, next) {
		console.log("Subscribe rooms");
		//console.log(req.socket.manager.rooms[''][0]);
		console.log(req.socket.manager.rooms);

		User.find(function foundUsers(err, users){
			if(err) return console.log(err);
			// Let's subscribe to the model class room so we can listen for the creation of new users via publishCreate
			User.subscribe(req.socket);

			// Let's also subscribe the existing users to the model instance room so we can listen for changes 
			// to the existing users via publishUpdate and publishDestroy
			User.subscribe(req.socket, users);

			console.log("subscribe called")

			res.send(200);	
		});
	},

	unsubscribe: function (req, res, next) {
		//console.log("Unsubscribe called");
		//console.log(req.socket.manager.rooms[''][0]);

		//User.unsubscribe(req.socket);
		//User.unsubscribe(req.socket, [{id: 48}]);
		User.find(function foundUsers(err, users){
			if(err) return console.log(err);
			// Let's subscribe to the model class room so we can listen for the creation of new users via publishCreate
			User.unsubscribe(req.socket);

			// Let's also subscribe the existing users to the model instance room so we can listen for changes 
			// to the existing users via publishUpdate and publishDestroy
			User.unsubscribe(req.socket, users);

			console.log("unsubscribe called")

			res.send(200);	
		});
		
		//req.socket.leave('');
		res.send(200)
	}
  
};
