myApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
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
}]);