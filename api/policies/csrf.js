module.exports = function(req, res, next) {
	// We send a new csrf token with each response, which angular is configured to look for and send back to us in a header
	res.cookie('csrftoken', res.locals._csrf);
	return next();
};