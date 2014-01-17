myApp.controller('FileUploadController', [ '$scope', '$upload', function($scope, $upload) {
  $scope.myModelObj;
  $scope.progress = 0;
  $scope.path = null;
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
        $scope.progress = 100.0 * evt.loaded / evt.total;
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
        console.log(data.path);
        $scope.path = "/" + data.path;
      });
      //.error(...)
      //.then(success, error, progress); 
    }
  };
}]);