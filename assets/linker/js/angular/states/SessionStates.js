myApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $stateProvider.state('login', {
            url: '/session/new',
            templateUrl: '/templates/session/session.new.html',
            controller: 'loginCtrl'
    });
    $stateProvider.state('login.mustbeloggedin', {
            url: '/mustbeloggedin/:errorMessage',
            templateUrl: '/templates/session/session.new.mustbeloggedin.html',
            controller: 'mustBeLoggedInCtrl'
    }); 
}]);