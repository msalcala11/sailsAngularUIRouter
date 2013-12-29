angular.module('appServices', ['ngResource'])
	.factory('Foods', function($resource){
		return $resource('/food/:foodId', { 'foodId' : '@id' }, //note: { 'foodId' : '@id' } is critical to insure "id" is not null at the server
					{
					'show'  : {method: 'GET'},
					'update': {method: 'PUT'}, //we want to match sails.js, since its update method is also PUT
					'create': {method: 'POST'},
					'destroy': {method: 'DELETE'}
					}
				);
	})
	// Note FoodsCreate is a hack for making the create command work with sails. It would be much better to 
	// incorporate it somehow into the Foods resource above
	.factory('FoodsCreate', function($resource){
		return $resource('/food/create', null,
					{
						'create' : {method: 'POST'}
					}
				);
	})
