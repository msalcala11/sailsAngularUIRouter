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

myApp.controller('userPhotosCtrl', ['$scope', 'User', 'UserFile', '$state', '$rootScope', '$sails', '$notification', '$timeout', '$cacheFactory', '$http',
    function($scope, User, UserFile, $state, $rootScope, $sails, $notification, $timeout, $cacheFactory, $http){

        $scope.disableRotationClass = false;
        $timeout(function () {$scope.disableRotationClass = true}, 500);

        $scope.getphotos = UserFile.index({userId : $rootScope.authStatus.id, fileType: 'image'}, function(data){
                $scope.photos = [];
                angular.forEach(data, function(item){
                    if(item.file_cdn_secure_url){
                        $scope.photos.push(item);
                    }
                });

                $timeout(function(){
                    $scope.pics = [];
                    var j = 0;
                    for (var i = 0; i < $scope.photos.length; i++) {
                        $timeout(function () {
                            $scope.pics.push($scope.photos[j]);
                            j++;
                        }, 100 * i);
                    } 
                }, 250)    
        })

        $scope.$on("ADD_FILE_TO_PARENT", function(event, file){
            //console.log("received message")
            //console.log(file)
            console.log(file.local_path)
            $scope.pics.push(file);  
        });

        $scope.editMode = function() {
            $scope.editing = true;
        }

        $scope.doneEditing = function() {
            $scope.editing = false;
        }

        $scope.deletePic = function(photo) {
            UserFile.destroy({userId : $rootScope.authStatus.id, fileType: 'image', fileId: photo.id, fileName: photo.file_name, cdnPublicId: photo.file_cdn_public_id});
            var index = $scope.pics.indexOf(photo);
            $scope.pics.remove(index);
            $cacheFactory.get('$http').remove('/file/index/' + $rootScope.authStatus.id+'?fileType=image');
            // If we are deleting the final pic remaining, then turn edit mode off
            //if($scope.pics.length === 0) $scope.doneEditing();
        }


        $scope.blocks = [];
        $scope.blocks[0] = {title: "Heading 1", body: "Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui."};
        $scope.blocks[1] = {title: "Heading 2", body: "Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui."};
        $scope.blocks[2] = {title: "Heading 3", body: "Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui."};

        $scope.updateBlock = function(block) {
            console.log("updateBlock called on " + block.title)
            //$resource services go here to comunicate with a server and write to the database
        }
}]);

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};