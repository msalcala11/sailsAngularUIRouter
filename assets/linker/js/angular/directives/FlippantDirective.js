myApp.directive('flippable', ['$rootScope', '$window', '$compile', '$parse', function($rootScope, $window, $compile, $parse){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: true, // {} = isolate, true = child, false/undefined = no change
        // cont­rol­ler: function($scope, $element, $attrs, $transclue) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, element, attrs, controller) {
   
            // Lets search through the dom elements within the div with the flippable attribute
            // and grab only the elements that contain text (i.e. h1, h2, h3, h4, h5, h6, and p)
            var justText = angular.element(element.children()[0]).find("h1, h2, h3, h4, h5, h6, p")

            // Let's iterate through these elements and generate corresponding inputs/textareas for dynamic
            // content, while duplicating static content for the back of the flipper
            var domArray = []
            var i = 0
            justText.each(function(index){

                tagText = this.innerText
                left2chars = tagText.substring(0,2)
                right2chars = tagText.substring(tagText.length, tagText.length-2)

                
                if(this.localName === "p") {
                    // If this is a p tag and loaded from a model (e.g. the contents are '{{exampleObject.property}}' ) then we will want a textarea to edit it
                    if(left2chars === "{{" && right2chars === "}}"){
                        // Strip away the curly braces
                        modelProperty = tagText.substring(2, tagText.length-2)
                        domArray[i] = '<p><textarea style="width:100%; max-width:32em; height:12em;" ng-model="'+modelProperty+'"></textarea></p>'
                    // If this is a static p tag, then just show it as it would normally appear
                    } else {
                        domArray[i] = this.outerHTML //'<'+this.localName+' class="'+ this.className +'">'+tagText+'</'+this.localName+'>'
                    }
                } else {
                    // If this is not a p tag (i.e. an h(1-6) tag) then we want to use an input to edit it
                    if(left2chars === "{{" && right2chars === "}}"){
                        // Strip away the curly braces
                        modelProperty = tagText.substring(2, tagText.length-2)
                        domArray[i] = '<p><input style="font-weight:bold" type="text" ng-model="'+modelProperty+'"></p>'
                    } else {
                        domArray[i] = this.outerHTML //'<'+this.localName+' class="'+ this.className +'">'+tagText+'</'+this.localName+'>'
                    }
                }
                i++
            })

            // Here's an array of messages we will randomly pick to show the user when he/she chooses to edit content
            var editMessageArr = [
                    "Let the creative juices flow ;)",
                    "You better not mess this up!",
                    "Create some awesome content",
                    "Sculpt you masterpiece",
                    "Tryin to be Charles Dickens over here, eh?",
                    "Change is good...<em>unless it's bad.</em>",
                    "Do your thing",
                    "Work your magic :)",
                    "Engineer excellence my friend"
            ];

            // Pick a random message from the array
            var key = Math.floor(Math.random() * editMessageArr.length);
            $scope.editMessage = editMessageArr[key];

            var editTag = "<p class='text-muted' style='text-align: left'>"+$scope.editMessage+"</p>"
            var closeButton = '<button type="button" class="close"  data-dismiss="modal" aria-hidden="true" ng-click="close()" style="margin-top: -37px">&times;</button>'
            var updateButton = '<p><button class="btn btn-info" type="submit">Update</button></p>'
            var content = ""
            for(i=0;i<domArray.length;i++){
                content = content + domArray[i];
            }

            $scope.backContent = '<form ng-submit="update()">'+editTag+closeButton + content + updateButton+"</form>";

            $scope.open = function(type) {
                var windowWidth = window.innerWidth

                $scope.timeout = 400

                // Compile the html so that angular knows to listen for ng-click and ng-submit, etc.
                // Then append it to the bottom of the div with the flippable attribute
                element.append($compile($scope.backContent)($scope))

                // If a flip type is specified in function call (i.e. open('modal')), then flip according to what is specified
                if (type === "modal") {
                    $scope.class_name = "flippant-modal-dark"
                    $scope.position = "fixed"
                    style_func = null_styles
                }
                else if (type === "card") {
                    $scope.class_name = "flippant-modal-light"
                    $scope.position = "absolute"
                    style_func = card_styles
                }
                // If no flip type (or no valid flip type) is specified, flip modal for mobile devices and flip card for larger ones
                else { 
                    if(windowWidth <= 560){
                        $scope.class_name = "flippant-modal-dark"
                        $scope.position = "fixed"
                        style_func = null_styles
                    }
                    else {
                        $scope.class_name = "flippant-modal-light"
                        $scope.position = "absolute"
                        style_func = card_styles
                    }
                }

                $scope.front = element.children()[0];
                $scope.back = element.children()[1];

                set_styles($scope.back, $scope.front, $scope.position)

                $scope.front.classList.add('flippant')
                $scope.back.classList.add('flippant-back')
                $scope.back.classList.add($scope.class_name)

                $window.setTimeout(function () {
                  style_func($scope.back)
                }, 0)

                $window.setTimeout(function () {
                    $scope.back.classList.add('flipper')
                    $scope.back.classList.add('flipped')
                    $scope.front.classList.add('flipped')
                  }, 0)   
            }

            $scope.close = function () {
                $scope.back.classList.remove('flipped')
                $scope.back.classList.remove('flipped')
                $scope.front.classList.remove('flipped')
                window.setTimeout(function () {
                  $scope.back.classList.remove($scope.class_name)
                  element.children()[1].remove()
                }, $scope.timeout)
                var key = Math.floor(Math.random() * editMessageArr.length);
                $scope.editMessage = editMessageArr[key];
                var editTag = "<p class='text-muted' style='text-align: left'>"+$scope.editMessage+"</p>"
                $scope.backContent = '<form ng-submit="update()">'+editTag+closeButton + content + updateButton+"</form>"
              }

            $scope.update = function () {
                // Parse and call the function that was passed into the on-update html attribute
                var invoker = $parse(attrs.onUpdate);
                invoker($scope);
                // Flip back to front
                $scope.close();
            }

            function set_styles(back, front, position) {
                back.style.position = position
                back.style.top = front.offsetTop + "px"
                back.style.left = front.offsetLeft + "px"
                back.style['min-height'] = front.offsetHeight + "px"
                back.style.width = front.offsetWidth + "px"
                back.style["z-index"] = 9999
            }

            function card_styles(back) {
                back.style.height = 'auto'
            }

            function null_styles(back) {
                back.style.top = null
                back.style.left = null
                back.style.height = null
                back.style.width = null
            }
        }
    };
}]);