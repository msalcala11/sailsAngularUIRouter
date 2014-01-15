/**
 * FileController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  // This enables us to access files from the '/public/images/' directory as defined in our routes.js
  // We should be able to use this to access files from any directory provided we specify the directory in routes.js
   get: function (req, res) {
    console.log(req.path);
    console.log(req.path.substr(1));
    res.sendfile(req.path.substr(1));
  },
  _config: {
    rest: false,
    shortcuts: false
  }
};
