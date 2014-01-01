myApp.controller('authCtrl', function($scope, $state, Auth, Csrf, $rootScope){
        
        // Let's initialize the user variable and the attributes that correspond to the input fields of the login form
        $scope.user = {
                username: "",
                password: ""
        }       
        
        $scope.createSession = function () {
                // Let's grab our csrf token from the server
                $scope.csrfToken = Csrf.query(function(response){
                        // Upon I/O completion, let's initialize and set a new user _csrf property in preparation for sending the create POST
                        $scope.user['_csrf'] = response._csrf;
                        // Lets send a POST to create the session
                        Auth.login($scope.user, createSessionSuccess, createSessionError);
                });
        }

        var createSessionSuccess = function(response) {
                console.log("Hooray!");
                console.log(response);
                //$rootScope.authStatus.set(response);
                //$state.go('home');
        }

        var createSessionError = function(error) {
                $scope.serverError = error.data; //This message is displayed in an alert box
                console.log("error:")
                console.log(error);
        }
});

//This is the overall controller for the body and is called perpetually to check whether the user is still logged in
myApp.controller('rootCtrl', function($scope, $state, Session, Csrf, $rootScope){
        
        // $rootScope.getAuthStatus = Session.check(function(response){
        //         $rootScope.authStatus.set(response);
        // });

        // // Run this function when the user clicks logout
        // $rootScope.logout = function() {
        //         $scope.csrfToken = Csrf.query(function (csrfResponse){
        //                 $scope.destroySession = Session.destroy({_csrf: csrfResponse._csrf}, function (response){
        //                         $rootScope.authStatus.clear();
        //                         $state.go("home");
        //                 });
        //         });       
        // }
        
});


