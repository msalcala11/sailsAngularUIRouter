myApp.controller('foodCtrl', ['$scope', '$rootScope', 'Food', '$timeout',
                 function($scope, $rootScope, Food, $timeout){
    console.log("food called")
    $scope.viewLoading = true;               
	//Lets grab all foods from the server
    //$scope.foods = Food.index();
	$scope.getfoods = Food.index(function(response){
        console.log("made it into Food.index")
		$scope.foods={}; //lets instantiate our foods variable so we can fill it up with the server data
		angular.forEach(response, function(item){
			if(item.name){ //if the object within the $resource object has a name property, it is a food and we want to add it to $scope.foods
				$scope.foods[item.id] = item;
			}
		});
        $scope.viewLoading = false;
        //$timeout(function() {$scope.viewLoading = false;}, 1000);
		return true;
	});

    // The following code controls offcanvas behavior for narrow screens
    $scope.arrowDirection = "left";
    $scope.offcanvasActive = true;

    $scope.toggleSidebar = function() {
        if($scope.offcanvasActive === false) {
            $scope.offcanvasActive = true;
            $scope.arrowDirection = "left";
        } else {
            $scope.offcanvasActive = false;
            $scope.arrowDirection = "right";
        } 
    }
}]);

myApp.controller('foodShowCtrl', ['$scope', '$rootScope', 'Food', '$stateParams', '$state', '$location', '$cacheFactory', '$http', '$timeout',
 function($scope, $rootScope, Food, $stateParams, $state, $location, $cacheFactory, $http, $timeout){

    $scope.viewLoading = true;

    if(!$cacheFactory.get('$http').get('/food/index')){// If $scope.$parent is not defined - then grab the whole list
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

            //$timeout(function() {$scope.viewLoading = false;}, 1000);
            $scope.viewLoading = false;
        });
    } else { // If $scope.$parent is defined then only grab the item that was selected from $scope.$parent (no need to make a server call)
            //$scope.food = Food.show({foodId: $stateParams.foodId}, function(res){
            $scope.food = $scope.$parent.foods[$stateParams.foodId];
            //$timeout(function() {$scope.viewLoading = false;}, 1000);
            $scope.viewLoading = false;
    }

    //$scope.food = Food.show({foodId: $stateParams.foodId});

	$scope.removeFood = function() {
            // The addDelete class and timeout enable us to change the default animation 
            // for the food being removed to something that conveys removal more intuitively.
            // The timeout gives us just enough time for the class to be changed before the animation takes
            // place.
            // However since the food is embedded in a ui-view and the delete class is being
            // activated in ng-class, this is not yet working due to the fact that ng-class 
            // does not update in real-time when added to a ui-view tag.
            $rootScope.addDeleteClass = true
            $timeout(function(){
                    //First lets remove it from browser memory, so the sidebar updates in real-time
                    delete $scope.foods[$stateParams.foodId];
                    
                    //Lets remove it from the database
                    Food.destroy({foodId: $stateParams.foodId});

                    // Let's clear the appropriate caches
                    $cacheFactory.get('$http').remove('/food/index');
                    $cacheFactory.get('$http').remove('/food/show/' + $scope.food.id);
                    $rootScope.addDeleteClass = false
                    //lets redirect the user to the master list
                    $state.go('food');
            }, 10)

	}

    $scope.updateFood = function() {
        Food.update($scope.food, function(response){
                // Let's remove the updated item from the cache since the cache is now outdated
                $cacheFactory.get('$http').remove('/food/index');
                $cacheFactory.get('$http').remove('/food/show/' + $scope.food.id);
                $state.go('food.show');
        });
    }
}]);

myApp.controller('foodEditCtrl', ['$scope', 'Food', '$stateParams', '$state', '$location', '$cacheFactory', '$http', '$timeout',
    function($scope, Food, $stateParams, $state, $location, $cacheFactory, $http, $timeout){
    $scope.viewLoading = true;

    if($scope.$parent.foods == null){ //if someone got to this state via the URL bar and parent $scope is undefined, we need to define it
    	// Let's grab $scope.$parent.foods asynchronously since a simply .query() gives issues
    	$scope.getfoods = Food.index(function(response) {
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
         //$timeout(function() {$scope.viewLoading = false;}, 1000);
         $scope.viewLoading = false;
         
        });

	} else { //$scope.$parent.foods was already defined so no need to make a server call. Woohoo efficiency!
        $scope.food = $scope.$parent.foods[$stateParams.foodId];
        // Let's set the parent foods object to the chosen object so as the user types,
        // the sidebar text will also be updated.
        $scope.$parent.foods[$stateParams.foodId] = $scope.food;
        $scope.viewLoading = false;
    }
 
	$scope.updateFood = function() {
        Food.update($scope.food, function(response){
                // Let's remove the updated item from the cache since the cache is now outdated
                $cacheFactory.get('$http').remove('/food/index');
                $cacheFactory.get('$http').remove('/food/show/' + $scope.food.id);
                $state.go('food.show');
        });
	}
	
}]);

myApp.controller('foodNewCtrl', ['$scope', 'Food', '$state', '$location', '$stateParams', '$cacheFactory', '$http',
    function($scope, Food, $state, $location, $stateParams, $cacheFactory, $http){
    
    //Create a food template to be displayed for editing
    $scope.food = {};
    $scope.food.name = "Type a name here";
    $scope.food.cals = 10;

    if(!$scope.$parent.foods){//If the user came here via the URL bar we must initialize foods to avoid errors
        $scope.$parent.foods = {};
    }
    // Create a placeholder in the side bar so the user's typing is also reflected in the sidebar
    $scope.$parent.foods['Placeholder'] = $scope.food;

    console.log($scope.$parent.foods)

    // If the user navigates away from the edit state before submitting the form, remove the placeholder from the list
    $scope.$on("$destroy", function(){
        delete $scope.$parent.foods['Placeholder'];
    });

    $scope.createFood = function () {
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
    }  
}]);