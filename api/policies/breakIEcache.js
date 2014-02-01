module.exports = function(req, res, next) {
	// This is to break the ie cache for all json GET requests
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires",0);
	return next();
};