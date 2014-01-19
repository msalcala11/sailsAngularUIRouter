myApp.controller('loginCtrl', ['$scope', '$state', 'Session', '$rootScope', 'Session',
    function($scope, $state, Session, $rootScope, Session){

        $scope.disableButton = function () { //This is for preventing the user from double-clicking the 
                //facebook/twitter login buttons and crashing the server
            $scope.buttonDisabled = true;
        }   
        
        // Let's initialize the user variable and the attributes that correspond to the input fields of the login form
        $scope.user = {
                email: "",
                password: ""
        }       
        
        $scope.createSession = function () {

            // Let's set the URL parameter 'authType' to local, which means we are using a username and password
            $scope.user['authType'] = "local";

            // Since we havent sent any data for this view, we have not received a csrf token in a cookie to prepare us
            // for this post request. Let's send an aribitrary GET request so we have our token
            Session.check(function(res){
                        // Lets send a POST to create the session
                        Session.create($scope.user, createSessionSuccess, createSessionError); 
                    }, function(err) {
                        // Lets send a POST to create the session
                        Session.create($scope.user, createSessionSuccess, createSessionError); 
            });
        }

        var createSessionSuccess = function(response) {

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
                $rootScope.authStatus.set(response);
                $state.go('home');
        }

        var createSessionError = function(error) {
                $scope.serverError = error.data; //This message is displayed in an alert box
        }
}]);

//This is the overall controller for the body and is called perpetually to check whether the user is still logged in
myApp.controller('mustBeLoggedInCtrl', ['$scope', '$state', 'Session', '$rootScope', '$stateParams',
    function($scope, $state, Session, $rootScope, $stateParams){
    
    // This is the error message sent back from a sails policy, and displays in an alert box    
    $scope.authError = $stateParams.errorMessage;
        
}]);