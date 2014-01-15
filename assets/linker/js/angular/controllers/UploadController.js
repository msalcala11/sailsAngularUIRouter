myApp.controller('FileUploadController', [ '$scope', '$upload', function($scope, $upload) {
  $scope.myModelObj = "pic";
  $scope.onFileSelect = function($files) {
    //$files: an array of files selected, each file has name, size, and type.
    $scope.files = $files;
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      $scope.upload = $upload.upload({
        url: '/upload/upload', //upload.php script, node.js route, or servlet url
        // method: POST or PUT,
        // headers: {'headerKey': 'headerValue'}, withCredential: true,
        data: {myObj: $scope.myModelObj},
        file: file,
        // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
        /* set file formData name for 'Content-Desposition' header. Default: 'file' */
        //fileFormDataName: myFile,
        /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
        //formDataAppender: function(formData, key, val){} 
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
      });
      //.error(...)
      //.then(success, error, progress); 
    }
  };
}]);















// // controller to handle the file upload event
// myApp.controller('FileUploadController', ['$scope', '$rootScope', 'FileUploadService', '$http',
//   function ($scope, $rootScope, FileUploadService, $http) {
//     var service = FileUploadService;
//     /** 
//      *  Handler to upload a new file to the server.
//      */
//     $scope.uploadFile = function ($files) {
//       console.log("made it into uploadFile")
//       var $file = $files[0];
//       console.log($file);
//       service.uploadFile($file, function (error) {
//         if (error) {
//           alert('There was a problem uploading the file.');
//         }
//         // handle successfully-uploaded file
//         console.log("Upload success!")
//       })
//       // var $file = $files[0];
//       // console.log($file);
//       //$http.post('/upload/upload', $file);
//     }
//   }]);

// // services should interact with the outside world
// myApp.factory('FileUploadService', ['$http', function ($http) {
//   console.log("Made it into FileUploadService");
//   var api = {
//     uploadFile: function (file, callback) {
//       console.log("made it into factor service.uploadFile")
//       $http.uploadFile({
//         url: '/upload/upload',
//         file: file
//       }).progress(function(event) {
//         console.log('percent: ' + parseInt(100.0 * event.loaded / event.total));
//       }).error(function (data, status, headers, config) {
//         console.error('Error uploading file')
//         callback(status);
//       }).then(function(data, status, headers, config) {
//         callback(null);
//       });
//     }
//   }
//   return api;
// }]);