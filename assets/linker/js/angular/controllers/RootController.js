//This is the overall controller for the body and is called perpetually to check whether the user is still logged in
myApp.controller('rootCtrl', ['$scope', '$state', 'Session', 'Csrf', '$rootScope', '$sails', '$notification',
 function($scope, $state, Session, Csrf, $rootScope, $sails, $notification) {
        
        $rootScope.getAuthStatus = Session.check(function(response){
                $rootScope.authStatus.set(response);
        });    

        // Run this function when the user clicks logout
        $rootScope.logout = function() {

                // Let's unsubscribe from the user class and instance rooms - must be sent over a socket
                $sails.get("/user/unsubscribe", function (data) {
                        console.log("Unsubscribe called on logout");
                        $rootScope.userSubscribed = false;
                });

                // Now let's actually logout
                $scope.csrfToken = Csrf.query(function (csrfResponse){
                        $scope.destroySession = Session.destroy({_csrf: csrfResponse._csrf}, function (response){
                                $rootScope.authStatus.clear();
                                $state.go("home");

                                //Here's an array of messages we will pick from randomly to show as a salutation 
                                //when the user logs out
                                var signOffMessageArr = [
                                        "Drop by again any time!",
                                        "Don't miss me too much ;)",
                                        "See you later alligator!",
                                        "Come back soon!",
                                        "Don't be a stranger now!",
                                        "Be good now!"
                                ];

                                // Pick a random message from the array
                                var key = Math.floor(Math.random() * signOffMessageArr.length);

                                // Show the message as a notification
                                $notification.success(signOffMessageArr[key], null, null);
                        });
                });       
        }
        
}]);