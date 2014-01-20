angular.module('appServices', ['ngResource'])

	.factory('Food', ['$resource', function($resource){
			return $resource("/food/:action/:foodId", {}, 
                        {
                             //These correspond to the actions defined in Sails
                            'index': { method:"GET", params: { 'action': 'index' }, isArray: true, cache: true},
                            'show' : { method:"GET", params: { 'action': 'show', 'foodId': '@id'}, isArray: false, cache: true},
                            'update': { method:"PUT", params: { 'action': 'update', 'foodId': '@id'}, isArray: false},
                            'destroy': { method:'DELETE', params: {'action': 'destroy', 'foodId': '@id'}, isArray: false},
                            'create' : { method:'POST', params: {'action' : 'create'}, isArray: false}
                    }
                );
	}])

	.factory('User', ['$resource', function($resource){
		return $resource("/user/:action/:userId", {}, 
			{
				//These correspond to the actions defined in Sails
		    	'index': { method:"GET", params: { 'action': 'index' }, isArray: true},
		    	'show' : { method:"GET", params: { 'action': 'show', 'userId': '@id'}, isArray: false},
		    	'update': { method:"PUT", params: { 'action': 'update', 'userId': '@id'}, isArray: false},
		    	'destroy': { method:'DELETE', params: {'action': 'destroy', 'userId': '@id'}, isArray: false},
		    	'create' : { method:'POST', params: {'action' : 'create'}, isArray: false}
	    	}
		);
	}])

	.factory('UserFile', ['$resource', function($resource){

		return $resource("/file/:action/:userId", {}, //?style query params are automatically appended when the resource is called
				{
					//These correspond to the actions defined in Sails
			    	'index': { method:"GET", params: { 'action': 'index', 'userId': '@id' }, isArray: true, cache: true}, // Get all images from DB for a user
			    // 	'show' : { method:"GET", params: { 'action': 'show', 'userId': '@id'}, isArray: false},
			    // 	'update': { method:"PUT", params: { 'action': 'update', 'userId': '@id'}, isArray: false},
			     	'destroy': { method:'DELETE', params: {'action': 'destroy', 'userId': '@id'}, isArray: false},
			    // 	'create' : { method:'POST', params: {'action' : 'create'}, isArray: false}
		    	}
			);
	}])

	.factory('Session', ['$resource', function($resource){
		return $resource("/session/:action/:authType", {}, //authType only used when doing create (denotes local, facebook, twitter, etc.)
			{
				//These correspond to the actions defined in Sails
		    	'destroy': { method:'DELETE', params: {'action': 'destroy'}, isArray: false},
		    	'create' : { method:'POST', params: {'action' : 'create', 'authType' : '@authType'}, isArray: false},
		    	'check'  : { method: 'GET', params: {'action' : 'check'}, isArray: false} //used to check if user is logged in if app is refreshed
	    	}
		);
	}])