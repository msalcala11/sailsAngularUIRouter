var myApp = angular.module("myApp", ['ui.router', 'appServices', 'contenteditable']);
	myApp.run(
      [        '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {

        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.lastListItem;
      }]);

        //Lets define our routes
        myApp.config(function ($stateProvider, $urlRouterProvider) {

                $urlRouterProvider.otherwise('/');

                $stateProvider.state('home', {
                        url: '/',
                        templateUrl: '/templates/home.html'
                });
                $stateProvider.state('about', {
                        url: '/about',
                        templateUrl: '/templates/about.html'
                });
                $stateProvider.state('food', {
                        url: '/food',
                        templateUrl: '/templates/food/index.html',
                        controller: 'foodCtrl'
                });
                $stateProvider.state('food.show', {
                        url: '/show/:foodId',
                        templateUrl: '/templates/food/food.show.html',
                        controller: 'foodShowCtrl'
                });
                $stateProvider.state('food.edit', {
                        url: '/edit/:foodId',
                        templateUrl: '/templates/food/food.edit.html',
                        controller: 'foodEditCtrl'
                });        
                $stateProvider.state('food.new', {
                    url:'/new',
                    templateUrl: '/templates/food/food.new.html',
                    controller: 'foodNewCtrl'
                });      
        });

        myApp.controller('foodCtrl', function($scope, Foods){
        	//Lets grab all foods from the server
        	$scope.getfoods = Foods.query(function(response){
        		$scope.foods={}; //lets instantiate our foods variable so we can fill it up with the server data
        		angular.forEach(response, function(item){
        			if(item.name){ //if the object within the $resource object has a name property, it is a food and we want to add it to $scope.foods
        				$scope.foods[item.id] = item;
        			}
        		});
        		return true;
        	});
        });

        myApp.controller('foodShowCtrl', function($scope, Foods, $stateParams, $state, $location){
        	//Lets grab from the server only the food that was selected
        	//$scope.food = Foods.get({foodId: $stateParams.foodId});
            $scope.getfoods = Foods.query(function(response){
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

            //$scope.food = Foods.show({foodId: $stateParams.foodId});

        	$scope.removeFood = function() {
        		//First lets remove it from browser memory, so the sidebar updates in real-time
        		delete $scope.foods[$stateParams.foodId];
        		//Lets remove it from the database
        		Foods.destroy({foodId: $stateParams.foodId});
        		//lets redirect the user to the master list
        		$state.go('food');
        	}
        });

        myApp.controller('foodEditCtrl', function($scope, Foods, $stateParams, $state, $location){
            if($scope.$parent.foods == null){ //if someone got to this state via the URL bar and parent $scope is undefined, we need to define it
            	// Let's grab $scope.$parent.foods asynchronously since a simply .query() gives issues
            	$scope.getfoods = Foods.query(function(response) {
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
        		Foods.update($scope.$parent.foods[$stateParams.foodId]);
                $state.go('food.show');
        	}
        	
        });

        myApp.controller('foodNewCtrl', function($scope, FoodsCreate, $state, $location, $stateParams){
            
            //Create a food template to be displayed for editing
            $scope.food = {};
            $scope.food.name = "Type a name here";
            $scope.food.cals = 10;

            if(!$scope.$parent.foods){//If the user came here via the URL bar we must initialize foods to avoid errors
                $scope.$parent.foods = {};
            }
            //create a placeholder in the side bar so the user's typing is also reflected in the sidebar
            $scope.$parent.foods['Placeholder'] = $scope.food;

            $scope.createFood = function () {

                //Create a food object and return it from the server. This will also give us an id autogenerated by postgres
                $scope.getFoods = FoodsCreate.create($scope.food, function(response){
                    $scope.newFood = response;
                    //replace the placholder in the side bar with the newly created food object
                    delete $scope.$parent.foods['Placeholder'];
                    $scope.$parent.foods[$scope.newFood.id] = $scope.newFood;
                    //Reroute the user to the foods show page
                    $location.path('/food/show/' + $scope.newFood.id); // ideally we would use $state.go
                    // but that was not working for whatever reason.
                });
            }

            
        });