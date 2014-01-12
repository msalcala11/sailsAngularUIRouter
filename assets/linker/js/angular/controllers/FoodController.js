myApp.controller('foodCtrl', ['$scope', 'Food',
                 function($scope, Food){
	//Lets grab all foods from the server
    //$scope.foods = Food.index();
	$scope.getfoods = Food.index(function(response){
		$scope.foods={}; //lets instantiate our foods variable so we can fill it up with the server data
		angular.forEach(response, function(item){
			if(item.name){ //if the object within the $resource object has a name property, it is a food and we want to add it to $scope.foods
				$scope.foods[item.id] = item;
			}
		});

		return true;
	});

    $scope.arrowDirection = "right";

    $scope.toggleArrow = function() {
        if($scope.arrowDirection === "left") $scope.arrowDirection = "right";
        else $scope.arrowDirection = "left";
    }
}]);

myApp.controller('foodShowCtrl', ['$scope', 'Food', '$stateParams', '$state', '$location', 'Csrf', '$cacheFactory', '$http',
 function($scope, Food, $stateParams, $state, $location, Csrf, $cacheFactory, $http){
	
    if(!$scope.$parent.foods){// If $scope.$parent is not defined - then grab the whole list
        // to populate the sidebar
        $scope.getfoods = Food.index(function(response){
            $scope.$parent.foods = {};
            angular.forEach(response, function(item){
                if(item.name){
                    $scope.$parent.foods[item.id] = item;

                    if(item.id == $stateParams.foodId){
                        $scope.food = item;
                    }
                }
            });
        });
    } else { // If $scope.$parent is defined then only grab the item that was selected
        $scope.food = Food.show({foodId: $stateParams.foodId});
    }

    //$scope.food = Food.show({foodId: $stateParams.foodId});

	$scope.removeFood = function() {
		
        $scope.getCsrf = Csrf.query(function (response) {
            //First lets remove it from browser memory, so the sidebar updates in real-time
    		delete $scope.foods[$stateParams.foodId];
    		//Lets remove it from the database
    		Food.destroy({foodId: $stateParams.foodId, _csrf: response._csrf});

            // Let's clear the appropriate caches
            $cacheFactory.get('$http').remove('/food/index');
            $cacheFactory.get('$http').remove('/food/show/' + $scope.food.id);
    		//lets redirect the user to the master list
    		$state.go('food');
        })
	}
}]);

myApp.controller('foodEditCtrl', ['$scope', 'Food', '$stateParams', '$state', '$location', 'Csrf', '$cacheFactory', '$http',
    function($scope, Food, $stateParams, $state, $location, Csrf, $cacheFactory, $http){
    if($scope.$parent.foods == null){ //if someone got to this state via the URL bar and parent $scope is undefined, we need to define it
    	// Let's grab $scope.$parent.foods asynchronously since a simply .query() gives issues
    	$scope.getfoods = Food.query(function(response) {
    		    // Let's initialize the objects we will be populating
    			$scope.$parent.foods = {};
                $scope.food = {};
                
                // Let's look through the server response and only include objects that have a name property.
                // If they have a name property that means they must be a food.
        		angular.forEach(response, function(item){
        			if(item.name){
                        // Let's iteratively populate the parent foods object to populate the sidebar
        				$scope.$parent.foods[item.id] = item;
                        // Now let's grab only the food that has been chosen for editing and assign it to $scope.food
                        if(item.id == $stateParams.foodId){
                            $scope.food = item;
                            // Let's set the parent foods object to the chosen object so as the user types,
                            // the sidebar text will also be updated.
                            $scope.$parent.foods[$stateParams.foodId] = $scope.food;
                        }
        			}
        		});
        });

	} else { //$scope.$parent.foods was already defined so no need to make a server call. Woohoo efficiency!
        $scope.food = $scope.$parent.foods[$stateParams.foodId];
        // Let's set the parent foods object to the chosen object so as the user types,
        // the sidebar text will also be updated.
        $scope.$parent.foods[$stateParams.foodId] = $scope.food;
    }
 
	$scope.updateFood = function() {
        $scope.getCsrf = Csrf.query(function (CsrfResponse){
            //Add a _csrf property to the object being sent so Sails can see it
            $scope.food['_csrf'] = CsrfResponse._csrf;
            //Food.update($scope.$parent.foods[$stateParams.foodId]);
            Food.update($scope.food, function(response){
                // Let's remove the updated item from the cache since the cache is now outdated
                $cacheFactory.get('$http').remove('/food/index');
                $cacheFactory.get('$http').remove('/food/show/' + $scope.food.id);
                $state.go('food.show');
            });

        });
	}
	
}]);

myApp.controller('foodNewCtrl', ['$scope', 'Food', '$state', '$location', '$stateParams', 'Csrf', '$cacheFactory', '$http',
    function($scope, Food, $state, $location, $stateParams, Csrf, $cacheFactory, $http){
    
    //Create a food template to be displayed for editing
    $scope.food = {};
    $scope.food.name = "Type a name here";
    $scope.food.cals = 10;

    if(!$scope.$parent.foods){//If the user came here via the URL bar we must initialize foods to avoid errors
        $scope.$parent.foods = {};
    }
    // Create a placeholder in the side bar so the user's typing is also reflected in the sidebar
    $scope.$parent.foods['Placeholder'] = $scope.food;

    $scope.createFood = function () {

        $scope.getCsrf = Csrf.query(function (CsrfResponse) {
            // Attach a _csrf property to the food object so that sails can find it
            $scope.food['_csrf'] = CsrfResponse._csrf;
            // Create a food object and return it from the server. This will also give us an id autogenerated by postgres
            $scope.getFood = Food.create($scope.food, function(response){
                $scope.newFood = response;
                // Replace the placholder in the side bar with the newly created food object
                delete $scope.$parent.foods['Placeholder'];
                $scope.$parent.foods[$scope.newFood.id] = $scope.newFood;

                // Let's clear the cache
                $cacheFactory.get('$http').remove('/food/index');

                //Reroute the user to the foods show page
                $location.path('/food/show/' + $scope.newFood.id); // ideally we would use $state.go
                // but that was not working for whatever reason.
            });

        })
        
    }  
}]);