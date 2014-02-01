////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////// Directive to make any content flippable for editing
//////// Author: Marty Alcala
//////// Example Usage:

// <div class="fade" ng-class="{in: food.name.length}" flippable on-submit="updateFood()" submit-button-text="Update">
//         <div> //flipped content must be wrapped in a div like this to work
//             <h3>{{food.name}}</h3>
//             <div class="showOnBack">{{food.cals}} kcals</div>
//             <hr> //will not be displayed on back
//             <a ng-click="open()" type="submit" class="btn btn-warning">Edit</a> //will not be displayed on back
//             <a href ng-click="removeFood()" class="btn btn-danger">Delete</a> // will not be displayed on back
//         </div>
// </div>

// Just add a flippable attribute to any tag, along with a <div> inner wrapper and you're good to go!

// <p> tags must ONLY contain dynamic content or ONLY contain static content. No static content can be mixed in
// with dynamic content in a <p> tag. 
// Good: <p>{{object.text}}</p>
// Good: <p>Hi please enter your credentials here</p>
// Bad: <p>Hi {{object.name}}, please step over here.</p>

// When <p> tags contain dynamic content, they get replaced by text area on the back
// when <p> tags contain static content, they are displayed exactly the same as they were on the front

// If it is necessary to mix static and dynamic content use a <div class="showOnBack"> like in the example above

// Also it is OK to mix static and dynamic content in any h tag. E.g. <h1>Welcome to {{object.name}}'s profile!</h1>
// will simply replace the {{object.name}} with an input tag with bold font while keeping all of the static text
// in exaclty the same place

// Any other tag can be included on the back by adding <div class="showOnBack">

// The contents of h tags get converted to inputs if they contain dynamic content

// You can specify a function to be executed from any arbitrary parent controller by passing it into the 
// on-submit attribute like in the example above

// You can also change the text shown on the submit button by passing it in to the submit-button-text attribute
// as shown in the example above

// You can also add a randomly generated tounge-in-cheek edit message at the top of the back by setting
// the random-edit-message attribute attribute to something truthy

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
            // and grab only the elements that contain text (i.e. h1, h2, h3, h4, h5, h6, and p, and any tag with the class .showOnBack)
            var justText = jQuery(element.children()[0]).find("h1, h2, h3, h4, h5, h6, p, .showOnBack")
            // Let's iterate through these elements and generate corresponding inputs/textareas for dynamic
            // content, while duplicating static content for the back of the flipper
            var domArray = []
            var i = 0
            justText.each(function(index){
                tagText = this.childNodes[0].data//this.innerText
                left2chars = tagText.substring(0,2)
                right2chars = tagText.substring(tagText.length, tagText.length-2)
                
                if(this.localName === "p") {
                    // If this is a p tag and loaded from a model (e.g. the contents are '{{exampleObject.property}}' ) then we will want a textarea to edit it
                    if(left2chars === "{{" && right2chars === "}}"){
                        // Strip away the curly braces
                        modelProperty = tagText.substring(2, tagText.length-2)
                        domArray[i] = '<p><textarea class="form-control" style="width:100%; max-width:32em; height:12em;" ng-model="'+modelProperty+'"></textarea></p>'
                    // If this is a static p tag, then just show it as it would normally appear
                    } else {
                        domArray[i] = this.outerHTML //'<'+this.localName+' class="'+ this.className +'">'+tagText+'</'+this.localName+'>'
                    }
                } else {
                    // If this is not a p tag (i.e. an h(1-6) tag or div tag) then we want to use an input to edit it any models within
                    var inlineStyle = ""
                    if(this.localName.substring(0,1) === "h") inlineStyle = 'font-weight:bold'
                    
                    // Lets grab all contents within double curly braces in the tagText
                    // and store each one into an array
                    var modelPropertyArr = getWordsBetweenCurlies(tagText)
                    if (modelPropertyArr.length > 0){

                        iteration = 0

                        // Let's replace all instances of double curly braces with an input field bound to an ng-model 
                        // that is identical to what is in the curly braces (i.e. {{object.name}} --> <input ng-model="object.name">)
                        newHTML = tagText.replace(/{{([^}]+)}}/g, function(foundString, key) {

                            var index = iteration
                            var replacementDom = '<input style="'+inlineStyle+'; line-height:110%; width: 125px; display: inline-block;" class="form-control" type="text" ng-model="'+ modelPropertyArr[index]+'">&nbsp'
                            if (iteration > 0) replacementDom = "&nbsp" + replacementDom
                            iteration++
                            return replacementDom;

                        });

                        domArray[i] = '<p style="line-height:200%;'+inlineStyle+';">'+newHTML+'</p>'
                    }
                    else {
                        domArray[i] = this.outerHTML
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

            var closeButtonMargin
            var editTag
            // If the random-edit-message attribute is truthy, include a random message from the array
            if(attrs.randomEditMessage){
                // Pick a random message from the array
                var key = Math.floor(Math.random() * editMessageArr.length);
                $scope.editMessage = editMessageArr[key];
                closeButtonMargin = "-37px"
                editTag = "<p class='text-muted' style='text-align: left'>"+$scope.editMessage+"</p>"
            }
            else {
                $scope.editMessage = ""
                editTag = ""
                closeButtonMargin = "-9px"
            }

            var closeButton = '<button type="button" class="close"  data-dismiss="modal" aria-hidden="true" ng-click="close()" style="margin-top: '+closeButtonMargin+';">&times;</button>'
            
            var submitButtonText = attrs.submitButtonText || "Submit"

            var submitButton = '<p><button class="btn btn-info" type="submit">'+submitButtonText+'</button></p>'
            var content = ""
            for(i=0;i<domArray.length;i++){
                content = content + domArray[i];
            }

            $scope.backContent = '<form ng-submit="submit()">'+editTag+closeButton + content + submitButton+"</form>";
            $scope.open = function(type) {
                var windowWidth = $(window).width();//window.innerWidth

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

                jQuery($scope.front).addClass('flippant')
                jQuery($scope.back).addClass('flippant-back')
                jQuery($scope.back).addClass($scope.class_name)

                $window.setTimeout(function () {
                  style_func($scope.back)
                }, 0)

                $window.setTimeout(function () {
                    jQuery($scope.back).addClass('flipper')
                    jQuery($scope.back).addClass('flipped')
                    jQuery($scope.front).addClass('flipped')
                  }, 0)   
            }

            $scope.close = function () {
                jQuery($scope.back).removeClass('flipped')
                jQuery($scope.back).removeClass('flipped')
                jQuery($scope.front).removeClass('flipped')
                window.setTimeout(function () {
                  jQuery($scope.back).removeClass($scope.class_name)
                  jQuery(element.children()[1]).remove()
                }, $scope.timeout)

                // If the random-edit-message attribute is truthy, include a random message from the array
                if(attrs.randomEditMessage){
                    // Pick a random message from the array
                    var key = Math.floor(Math.random() * editMessageArr.length);
                    $scope.editMessage = editMessageArr[key];
                    closeButtonMargin = "-37px"
                    editTag = "<p class='text-muted' style='text-align: left'>"+$scope.editMessage+"</p>"
                }
                else {
                    $scope.editMessage = ""
                    editTag = ""
                    closeButtonMargin = "-9px"
                }
                $scope.backContent = '<form ng-submit="submit()">'+editTag+closeButton + content + submitButton+"</form>"
              }

            $scope.submit = function () {
                // Parse and call the function that was passed into the on-submit html attribute
                var invoker = $parse(attrs.onSubmit);
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
                back.style.zIndex = "9999";
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

            function getWordsBetweenCurlies(str) {
              var results = [], re = /{{([^}]+)}}/g, text;
              while(text = re.exec(str)) {
                results.push(text[1]);
              }
              return results;
            }
        }
    };
}]);