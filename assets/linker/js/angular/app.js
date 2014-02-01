var myApp = angular.module("myApp", ['ui.router', 'appServices', 'contenteditable', 'ngSails', 'ngAnimate', 'notifications', 'angularFileUpload', 'ngDragDrop', 'ngCookies', 'ui.bootstrap', 'truncate']);
	myApp.run(
      [        '$rootScope', '$state', '$stateParams', '$location', '$http', '$cookies',
      function ($rootScope,   $state,   $stateParams, $location, $http, $cookies) {

        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $rootScope.authStatus = { //initializing authStatus for future use
            loggedIn: false,
            admin: false,
            name: "",
            id: null,
            set: function (response) { //method used for grabbing authStatus from server on logins and checks
                $rootScope.authStatus['loggedIn'] = response.loggedIn;
                $rootScope.authStatus['admin'] = response.admin;
                $rootScope.authStatus['name'] = response.name;
                $rootScope.authStatus['id'] = response.id;
                $rootScope.authStatus['pic'] = response.pic;
            },
            clear: function () { //method used for clearing authStatus on logout
                $rootScope.authStatus['loggedIn'] = false;
                $rootScope.authStatus['admin'] = false;
                $rootScope.authStatus['name'] = "";
                $rootScope.authStatus['id'] = null;
                $rootScope.authStatus['pic'] = null;
            }
        }

      }]);

        //Lets define our routes
        myApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$uiViewScrollProvider',
                    function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $uiViewScrollProvider) {

                // Necessary to prevent ui-router .0.2.8's new autoscroll
                $uiViewScrollProvider.useAnchorScroll()
                // Let's hookup csrf protection with sails
                // Sails sends us csrftoken with each request, we send back the same token as part of our request header
                $httpProvider.defaults.xsrfCookieName = 'csrftoken';
                $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';

                //$locationProvider.html5Mode(true); //removes the hash in the URL bar

                // Let's write the code to redirect to the login page if any of our requests return a 401
                // This can occurs when a user attmepts to access private content after the user's session expires
                var interceptor = ['$location', '$q', function($location, $q) {
                    function success(response) {
                        return response;
                    }

                    function error(response) {

                        if(response.status === 403) {
                            $location.path('/session/new/mustbeloggedin/'+response.data); //redirect to the login page
                            return $q.reject(response);
                        }
                        else {
                            return $q.reject(response);
                        }
                    }

                    return function(promise) {
                        return promise.then(success, error);
                    }
                }];

                $httpProvider.responseInterceptors.push(interceptor);


                $urlRouterProvider.otherwise('/');

                $stateProvider.state('home', {
                        url: '/',
                        templateUrl: '/templates/home.html'
                });
                $stateProvider.state('about', {
                        url: '/about',
                        templateUrl: '/templates/about.html'
                });  
                $stateProvider.state('signup', {
                        url: '/user/new',
                        templateUrl: '/templates/user/user.new.html',
                        controller: 'userNewCtrl'
                });   
        }]);

        