describe('filter', function() {
	var checkmarkFilter;

	beforeEach(module('phonecatFilters'));

	beforeEach(inject(function(_checkmarkFilter_){
		checkmarkFilter = _checkmarkFilter_;
	}));

	describe('checkmark', function() {
		it('should convert boolean values to unicode checkmark or cross', function(){
			expect(checkmarkFilter(true)).toBe('\u2713');
			expect(checkmarkFilter(false)).toBe('\u2718');
		});

		it('should convert an undefined value to a cross', function(){
			expect(checkmarkFilter(undefined)).toBe('?');
		});

		it('should convert "Marty" to "a"', function(){
			expect(checkmarkFilter("Hi")).toBe('a');
		});
	})
})