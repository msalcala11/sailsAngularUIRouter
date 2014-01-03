myApp.controller('userCtrl', function($scope, User, Csrf, $state, $rootScope){
          
});

myApp.controller('userListCtrl', function($scope, User, Csrf, $state, $rootScope){

        $scope.getUsers = User.index(function foundUsers(response){
                $scope.users = {};
                angular.forEach(response, function(item){
                        if(item.name){
                                $scope.users[item.id] = item;
                        }   
                });
        });

        $scope.deleteUser = function(id) {

                Csrf.query(function (CsrfResponse) {
                        User.destroy({userId: id, _csrf: CsrfResponse._csrf}, function(response){
                                delete $scope.users[id];
                        });
                });
        }
});


myApp.controller('userNewCtrl', function($scope, User, Csrf, $state, $rootScope){
        
        // Let's initialize the user variable and the attributes that correspond to the input fields of the sign-up form
        $scope.user = {
                name: "",
                email: "",
                password: ""
        }       
        
        $scope.createUser = function () {
                // Let's grab our csrf token from the server
                $scope.csrfToken = Csrf.query(function(response){
                        // Upon I/O completion, let's initialize and set a new user _csrf property in preparation for sending the create POST
                        $scope.user['_csrf'] = response._csrf;
                        // Lets send a POST to create the user
                        User.create($scope.user, function(response){
                                //The server is configured to send back the authStatus of the user (loggedIn: true; admin: false)
                                $rootScope.authStatus.set(response);
                                $state.go("home");
                        });
                });
        }
});