myApp.directive('myLoadingSpinner', function() {
    return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope: {
        loading: '=myLoadingSpinner'
      },
      templateUrl: '/templates/directives/loading.html',
      link: function(scope, element, attrs) {

      }
    };
});
