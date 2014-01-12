myApp.directive('accessLevel', ['$rootScope', function($rootScope){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // cont­rol­ler: function($scope, $element, $attrs, $transclue) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, element, attrs, controller) {
            var prevDisplay = element.css('display'); 
            $rootScope.$watch('authStatus', function(){ //listen for changes in authStatus and either hide or show element 
                if(!$rootScope.authStatus.loggedIn){ //If the user is not logged in, do not show
                    element.css('display', 'none');
                } else if((attrs.accessLevel === 'admin') && !$rootScope.authStatus.admin){ 
                // If the user is logged in and not an admin, do not show if access-level is set to admin
                    element.css('display', 'none');
                } else {
                    element.css('display', prevDisplay);
                }

            }, true); //the true checks to see if any property of the authStatus object has changed
        }
    };
}]);