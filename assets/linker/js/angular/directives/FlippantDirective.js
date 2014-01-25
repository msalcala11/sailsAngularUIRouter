myApp.directive('flippable', ['$rootScope', '$window', '$compile', function($rootScope, $window, $compile){
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
            //var prevDisplay = element.css('display');
            console.log(element)
            console.log(angular.element(element.children()[0]).find("h1, h2, h3, h4, h5, h6, p"))
            var justText = angular.element(element.children()[0]).find("h1, h2, h3, h4, h5, h6, p")
            var domArray = []
            var i = 0
            justText.each(function(index){

                tagText = this.innerText
                left2chars = tagText.substring(0,2)
                right2chars = tagText.substring(tagText.length, tagText.length-2)

                if(this.localName === "p") {
                    if(left2chars === "{{" && right2chars === "}}"){
                        modelProperty = tagText.substring(2, tagText.length-2)
                        domArray[i] = '<p><textarea style="width:100%; max-width:32em; height:12em;" ng-model="'+modelProperty+'"></textarea></p>'
                    } else {
                        domArray[i] = '<'+this.localName+' class="'+ this.className +'">'+tagText+'</'+this.localName+'>'
                    }
                } else {
                    if(left2chars === "{{" && right2chars === "}}"){
                        modelProperty = tagText.substring(2, tagText.length-2)
                        domArray[i] = '<p><input style="color:red" type="text" ng-model="'+modelProperty+'"></p>'
                    } else {
                        domArray[i] = '<'+this.localName+' class="'+ this.className +'">'+tagText+'</'+this.localName+'>'
                    }
                }

                i++
            })
            console.log(domArray)

            //Here's an array of messages we will pick from randomly to show the user when he/she chooses to edit content
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
            var updateButton = '<p><button class="btn btn-info" ng-click="close()">Update</button></p>'
            var content = ""
            for(i=0;i<domArray.length;i++){
                content = content + domArray[i];
            }

            $scope.backContent = "<div>"+editTag+closeButton + content + updateButton+"</div>";

            //maybe pass in an aribitrary function as an attribute and then set in here to what we need?
            $scope.open = function(type) {

                $scope.timeout = 400

                element.append($compile($scope.backContent)($scope))

                if (type === "modal") {
                    $scope.class_name = "flippant-modal-dark"
                    $scope.position = "fixed"
                    style_func = null_styles
                }
                if (type === "card") {
                    $scope.class_name = "flippant-modal-light"
                    $scope.position = "absolute"
                    style_func = card_styles
                }

                $scope.front = element.children()[0];
                $scope.back= element.children()[1];

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
                $scope.backContent = "<div>"+editTag+closeButton + content + updateButton+"</div>";
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