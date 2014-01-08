myApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
	$stateProvider.state('user', {
            url: '/user',
            templateUrl: '/templates/user/index.html',
            controller: 'userCtrl'
    });
    $stateProvider.state('user.list', {
            url: '/list',
            templateUrl: '/templates/user/user.list.html',
            controller: 'userListCtrl'
    });
}]);