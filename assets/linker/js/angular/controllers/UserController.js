myApp.controller('userCtrl', ['$scope', 'User', 'Csrf', '$state', '$rootScope',
    function($scope, User, Csrf, $state, $rootScope){
          
}]);

myApp.controller('userListCtrl', ['$scope', 'User', 'Csrf', '$state', '$rootScope', '$sails', '$notification', '$timeout',
    function($scope, User, Csrf, $state, $rootScope, $sails, $notification, $timeout){

        $scope.viewLoading = true;

        $scope.getUsers = User.index(function foundUsers(response){
                $scope.users = {};
                angular.forEach(response, function(item){
                        if(item.name){
                                $scope.users[item.id] = item;
                        }   
                });
                //$timeout(function() {$scope.viewLoading = false;}, 1000);
                $scope.viewLoading = false;
        });

        // This anonymous function handles socket communication to update login status in real time
        (function () {
            if(!$rootScope.userSubscribed){ // Only subscribe if not already done so, to prevent multiple connections and memory leaks
                $sails.get("/user/subscribe", function (data) {
                        console.log("Subscribed to user");
                        $rootScope.userSubscribed = true;
                });
                
                $sails.on("message", function (message) {

                    if($rootScope.authStatus.loggedIn){ //only display notification if logged in
                        if(message.verb === 'update'){
                            // Update user list on screen with socket message
                            $scope.users[message.data.id].online = message.data.loggedIn;
                            // Display notification that a new user has logged in
                            $notification.success(message.data.name + message.data.action, null, null);   
                        }
                        else if(message.verb === 'create'){
                            $scope.users[message.data.id] = message.data;
                            $notification.success(message.data.name + " has signed up and logged in.", null, null); 
                        }
                        else if(message.verb === 'destroy') {
                            $notification.success($scope.users[message.id].name + " has been deleted.", null, null);
                            delete $scope.users[message.id]; 
                        }
                    }
                });
            } else {
                console.log("already subscribed to user");
            } 
        }());

        $scope.deleteUser = function(id) {

                Csrf.query(function (CsrfResponse) {
                        User.destroy({userId: id, _csrf: CsrfResponse._csrf}, function(response){
                                delete $scope.users[id];
                        });
                });
        }

}]);


myApp.controller('userNewCtrl', ['$scope', 'User', 'Csrf', '$state', '$rootScope',
    function($scope, User, Csrf, $state, $rootScope){
        
        // Let's initialize the user variable and the attributes that correspond to the input fields of the sign-up form
        $scope.user = {
                name: "",
                email: "",
                password: ""
        }

        $scope.disableButton = function () { //This is for preventing the user from double-clicking the 
                //facebook/twitter login buttons and crashing the server
            $scope.buttonDisabled = true;
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
}]);