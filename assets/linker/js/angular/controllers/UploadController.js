myApp.controller('FileUploadController', [ '$scope', '$upload', '$timeout', function($scope, $upload, $timeout) {
  $scope.myModelObj;
  $scope.recentUploads = [];
  $scope.path = null;
  $scope.showPanel = false;
  $scope.onFileSelect = function($files) {
    $scope.showPanel = true;
    //$files: an array of files selected, each file has name, size, and type.
    $scope.files = $files;

    var j = 0; //used to increment on each success call
    var k = 0; //used to increment on each progress call
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      $scope.recentUploads.unshift(file);
      console.log($scope.recentUploads);
      console.log($scope.recentUploads[i].name)
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
        $scope.files[k].progress = Math.round(100.0 * evt.loaded / evt.total);
        //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        k++
      }).success(function(file, status, headers, config) {
        // file is uploaded successfully
        $scope.files[j].path = "/" + file.file_path;
        $scope.$emit("ADD_FILE_TO_PARENT", file);
        $scope.showPanel = true;

        countDown = $timeout(function(){$scope.showPanel=false}, 5000);
        j++;
      });
    }
  };

  $scope.closePanel = function () {
    $scope.showPanel = false;
  }

  $scope.stopTimer = function () {
    $timeout.cancel(countDown);
  }

}]);