//This is the overall controller for the body and is called perpetually to check whether the user is still logged in
myApp.controller('rootCtrl', function($scope, $state, Session, Csrf, $rootScope, $sails, $notification) {
        
        $rootScope.getAuthStatus = Session.check(function(response){
                $rootScope.authStatus.set(response);
        });    


        // Run this function when the user clicks logout
        $rootScope.logout = function() {

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

                                // var signOffMessageArr = [
                                //         "See you later alligator", 
                                //         "In a while crocodile",
                                //         "See you soon raccoon",  
                                //         "Laters taters", 
                                //         "Blow a kiss Jelly Fish!", 
                                //         "Bye-bye, butterfly",  
                                //         "Give a hug, ladybug",  
                                //         "Toodle-ee-oo, kangaroo",  
                                //         "Time to go, buffalo",  
                                //         "Can’t stay, blue jay", 
                                //         "Take care, polar bear",  
                                //         "Out the door, dinosaur",  
                                //         "Be sweet, parakeet",  
                                //         "So long, king kong",  
                                //         "Toodle-doo, Cockatoo", 
                                //         "Better swish, jellyfish",  
                                //         "Take care, teddy bear",  
                                //         "Bye for now, brown cow",  
                                //         "Hasta Manana, Iguana",  
                                //         "Time to squirm, wiggle worm",  
                                //         "Gotta scat, kitty cat",  
                                //         "Better skadoodle, poodle",  
                                //         "Stay loose, silly goose",  
                                //         "Till then, Penguin" 
                                // ];

                                // Pick a random message from the array
                                var key = Math.floor(Math.random() * signOffMessageArr.length);

                                // Show the message as a notification
                                $notification.success(signOffMessageArr[key], null, null);
                        });
                });       
        }
        
});