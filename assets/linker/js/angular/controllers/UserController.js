myApp.controller('userCtrl', ['$scope', 'User', '$state', '$rootScope',
    function($scope, User, $state, $rootScope){
          
}]);

myApp.controller('userListCtrl', ['$scope', 'User', '$state', '$rootScope', '$sails', '$notification', '$timeout',
    function($scope, User, $state, $rootScope, $sails, $notification, $timeout){

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
                        User.destroy({userId: id}, function(response){
                                delete $scope.users[id];
                        });
        }

}]);


myApp.controller('userNewCtrl', ['$scope', 'User', '$state', '$rootScope', 'Session',
    function($scope, User, $state, $rootScope, Session){
        
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

            // Since we havent sent any data for this view, we have not received a csrf token in a cookie to prepare us
            // for this post request. Let's send an aribitrary GET request so we have our token
            Session.check(function(res){
                // Lets send a POST to create the user
                User.create($scope.user, function(response){
                        //The server is configured to send back the authStatus of the user (loggedIn: true; admin: false)
                        $rootScope.authStatus.set(response);
                        $state.go("home");
                });
            }, function(err){
                // Lets send a POST to create the user
                User.create($scope.user, function(response){
                        //The server is configured to send back the authStatus of the user (loggedIn: true; admin: false)
                        $rootScope.authStatus.set(response);
                        $state.go("home");
                });
            });


        }
}]);

myApp.controller('userPhotosCtrl', ['$scope', 'User', 'UserFile', '$state', '$rootScope', '$sails', '$notification', '$timeout',
    function($scope, User, UserFile, $state, $rootScope, $sails, $notification, $timeout){
        //console.log("userId: " + $rootScope.authStatus.id)
        $scope.getphotos = UserFile.images.index({userId : $rootScope.authStatus.id, fileType: 'image'}, function(data){
                $scope.photos = [];
                angular.forEach(data, function(item){
                    if(item.file_name){
                        $scope.photos.push(item);
                    }
                });
                //console.log($scope.photos);

                $scope.pics = [];
                var j = 0;
                for (var i = 0; i < $scope.photos.length; i++) {
                    $timeout(function () {
                        $scope.pics.push($scope.photos[j]);
                        j++;
                        //console.log($scope.pics);
                    }, 50 * i);
                }     
        })

        $scope.$on("ADD_FILE_TO_PARENT", function(event, file){
            //console.log("received message")
            //console.log(file)
            
            $scope.pics.push(file);  
        });

        $scope.editMode = function(photo) {
            $scope.editing = true;
        }

        $scope.doneEditing = function(photo) {
            $scope.editing = false;
        }

        $scope.deletePic = function(photo) {
            console.log(photo)
            UserFile.images.destroy({userId : $rootScope.authStatus.id, fileType: 'image', fileId: photo.id, fileName: photo.file_name});
            var index = $scope.pics.indexOf(photo);
            $scope.pics.remove(index);
        }

}]);

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};