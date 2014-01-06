var myApp = angular.module("myApp", ['ui.router', 'appServices', 'contenteditable', 'ngCookies', 'ngSails', 'ngAnimate', 'notifications']);
	myApp.run(
      [        '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams, $cookieStore, $location) {

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
        myApp.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

                //$locationProvider.html5Mode(true); //removes the hash in the URL bar

                // Let's write the code to redirect to the login page if any of our requests return a 401
                // This can occurs when a user attmepts to access private content after the user's session expires
                var interceptor = ['$location', '$q', function($location, $q, $rootScope) {
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
        });

myApp.directive('accessLevel', ['$rootScope', function($rootScope){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // cont­rol­ler: function($scope, $element, $attrs, $transclue) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, element, attrs, controller) {
            var prevDisplay = element.css('display'); 
            $rootScope.$watch('authStatus', function(){ //listen for changes in authStatus and either hide or show element 
                if(!$rootScope.authStatus.loggedIn){ //If the user is not logged in, do not show
                    element.css('display', 'none');
                } else if((attrs.accessLevel === 'admin') && !$rootScope.authStatus.admin){ 
                // If the user is logged in and not an admin, do not show if access-level is set to admin
                    element.css('display', 'none');
                } else {
                    element.css('display', prevDisplay);
                }

            }, true); //the true checks to see if any property of the authStatus object has changed
        }
    };
}]);

        