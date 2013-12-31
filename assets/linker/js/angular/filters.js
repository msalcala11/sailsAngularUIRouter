angular.module('phonecatFilters', []).filter('checkmark', function (){ //just in here to practice Unit Testing
	return function(input) {
		if(angular.isUndefined(input)) return '?';
		else if(input === "Hi") return 'a';
		return input ? '\u2713' : '\u2718';
	};
});