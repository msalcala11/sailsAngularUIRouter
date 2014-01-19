/**
 * FoodController
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
    
  //used for grabbing all records and individual records if a parameter is provided to food/:foodId
  index: function (req, res, next) {

  	Food.find(function foundFood (err, foods){
  		if(err) return next(err);
  		else{//send the array of foods as a json response
    		console.log("index called")
        console.log(req.session.authStatus);
    		res.json(foods);
      }
  	});
  },

  show: function (req, res, next) {
  	Food.findOne(req.param('id'), function foundFood(err, food){
  		if (err) {
  			console.log(err);
  		} else {
  			console.log("Show called")
  			res.json(food);
  		}
  	});
  },

  update: function(req, res, next) {
  	
  	Food.update(req.param('id'), req.params.all(), function foodUpdated(err, food) {
  		if (err) res.send(500);
  		else {
  			console.log("update called")
        console.log("params:")
        console.log(req.params.all())
  			res.send(200);
  		}
  	});
  },

  destroy: function(req, res, next) {
  	Food.findOne(req.param('id'), function foundFood(err, food) {
  		if (err) res.send(500);
  		else {
  			Food.destroy(req.param('id'), function foodDestroyed(err){
  				if (err) {
  					res.send(500);
  				}
  				else{
  					console.log("destroy called")
  					res.send(200);
  				}
  			});
  		}
  	});
  },

  create: function(req, res, next){
  	Food.create(req.params.all(), function foodCreated (err, food){
  		console.log("create called")
  		if (err) res.send(500);
  		else{
  			res.send(food);
  		}
  	});
  }


  
};
