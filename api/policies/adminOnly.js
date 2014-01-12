/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
  console.log("adminOnly called");

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.session.authStatus) { //if authStatus exists, the user must be logged in 
  		if(req.session.authStatus.admin){
  			return next();
  		}
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.send(403, "You must be an admin to perform this action.");//res.forbidden('You are not permitted to perform this action.');
};
