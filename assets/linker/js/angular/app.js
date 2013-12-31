var myApp = angular.module("myApp", ['ui.router', 'appServices', 'contenteditable', 'phonecatFilters']);
	myApp.run(
      [        '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {

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
            },
            clear: function () { //method used for clearing authStatus on logout
                $rootScope.authStatus['loggedIn'] = false;
                $rootScope.authStatus['admin'] = false;
                $rootScope.authStatus['name'] = "";
                $rootScope.authStatus['id'] = null;
            }
        }

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
                $stateProvider.state('login', {
                        url: '/session/new',
                        templateUrl: '/templates/session/session.new.html',
                        controller: 'loginCtrl'
                });  
                $stateProvider.state('signup', {
                        url: '/user/new',
                        templateUrl: '/templates/user/user.new.html',
                        controller: 'userNewCtrl'
                });  
        });

        