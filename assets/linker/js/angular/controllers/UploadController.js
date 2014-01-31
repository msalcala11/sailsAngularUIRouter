myApp.controller('FileUploadController', [ '$scope', '$upload', '$timeout', '$cacheFactory', '$rootScope', '$http',
 function($scope, $upload, $timeout, $cacheFactory, $rootScope, $http) {
  $scope.myModelObj;
  $scope.recentUploads = [];
  //console.log(JSON.parse(JSON.stringify($scope.recentUploads)))
  $scope.showPanel = false;

  $scope.closePanel = function () {
    $scope.showPanel = false;
  }

  // Prevents the upload panel from disappearing automatically after 5 seconds if the user 
  // mouses over the panel
  $scope.stopTimer = function () { 
    if($scope.uploadCompleted) $timeout.cancel(countDown);
    else $scope.autoDisappear = false;
  }

  $scope.updateFileInRecentUploads = function(selectedFilesIndex, recentUploads, property, newValue) {
      var recentUpload = _.findWhere(recentUploads, {selectedFilesIndex: selectedFilesIndex, uploadBatchIndex: $scope.uploadBatchIndex});

      if(recentUpload.uploadBatchIndex === $scope.uploadBatchIndex && recentUpload.selectedFilesIndex === selectedFilesIndex){
          recentUpload[property] = newValue;
      }
  }

  $scope.howToSend = 1; //This setting sends each file iteratively rather then sending all files at once
  $scope.fileReaderSupported = window.FileReader != null;
  $scope.uploadRightAway = true;
  $scope.uploadCompleted = false;
  $scope.autoDisappear = true;
  $scope.uploadBatchIndex = 0;
  // $scope.changeAngularVersion = function() {
  //   window.location.hash = $scope.angularVersion;
  //   window.location.reload(true);
  // }
  // $scope.hasUploader = function(index) {
  //   return $scope.upload[index] != null;
  // };
  $scope.abort = function(index) {
    $scope.upload[index].abort(); 
    $scope.upload[index] = null;
  };
  // $scope.angularVersion = window.location.hash.length > 1 ? window.location.hash.substring(1) : '1.2.0';
  $scope.onFileSelect = function($files) {
    $scope.uploadBatchIndex++;
    // The user has now re-entered new files into the upload box so first lets abort the previous uploads if 
    // there were any before we proceed to uploading the new files
    $scope.uploadCompleted = false;
    $scope.selectedFiles = [];
    $scope.progress = [];
    if ($scope.upload && $scope.upload.length > 0) {
      for (var i = 0; i < $scope.upload.length; i++) {
        if ($scope.upload[i] != null) {
          $scope.upload[i].abort();
        }
      }
    }
    $scope.upload = [];
    $scope.uploadResult = [];
    $scope.selectedFiles = $files;
    $scope.dataUrls = [];
    for ( var i = 0; i < $files.length; i++) {
      var $file = $files[i];
      $file.uploadBatchIndex = $scope.uploadBatchIndex;
      $file.selectedFilesIndex = i;

      $scope.recentUploads.unshift($file);
      if (window.FileReader && $file.type.indexOf('image') > -1) {
          var fileReader = new FileReader();
            fileReader.readAsDataURL($files[i]);
            function setPreview(fileReader, index) {
                fileReader.onload = function(e) {
                    $timeout(function() {
                      $scope.updateFileInRecentUploads(index, $scope.recentUploads, 'dataUrl', e.target.result);
                      $scope.showPanel = true;
                    });
                }
            }
            setPreview(fileReader, i);
      }
      $scope.progress[i] = -1;
      if ($scope.uploadRightAway) {
        $scope.start(i);
      }
    }
    $scope.uploadCompleted = true;
    if($scope.autoDisappear) countDown = $timeout(function(){$scope.showPanel=false}, 5000);
    console.log("upload completed")
    $cacheFactory.get('$http').remove('/file/index/' + $rootScope.authStatus.id+'?fileType=image');
  }
  
  $scope.start = function(index) {
    console.log("began upload")
    $scope.progress[index] = 0;
    if ($scope.howToSend == 1) {
      console.log("about to upload")
      console.log($scope.selectedFiles[index])
      $scope.upload[index] = $upload.upload({
        url : '/upload/upload',
        method: $scope.httpMethod,
        headers: {'myHeaderKey': 'myHeaderVal'},
        data : {
          myModel : $scope.myModel
        },
        /* formDataAppender: function(fd, key, val) {
          if (angular.isArray(val)) {
                        angular.forEach(val, function(v) {
                          fd.append(key, v);
                        });
                      } else {
                        fd.append(key, val);
                      }
        }, */
        file: $scope.selectedFiles[index],
        fileFormDataName: 'file'
      }).then(function(response) {

          $scope.recentUploads.some(function (recentUpload){
            if(recentUpload.uploadBatchIndex === $scope.uploadBatchIndex && recentUpload.selectedFilesIndex === index){
              response.data.local_path = recentUpload.dataUrl;
              $scope.$emit("ADD_FILE_TO_PARENT", response.data);
            }
          });

          
      }, null, function(evt) {
        $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
        $scope.updateFileInRecentUploads(index, $scope.recentUploads, 'progress', parseInt(100.0 * evt.loaded / evt.total));
      });
    } else {
      var fileReader = new FileReader();
          fileReader.readAsArrayBuffer($scope.selectedFiles[index]);
            fileReader.onload = function(e) {
            $scope.upload[index] = $upload.http({
              url: 'upload',
          headers: {'Content-Type': $scope.selectedFiles[index].type},
          data: e.target.result
        }).then(function(response) {
          $scope.uploadResult.push(response.data.result);
        }, null, function(evt) {
          // Math.min is to fix IE which reports 200% sometimes
          $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
            }
    }
  }

}]);