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
  // This enables us to access files from the '/public/images/' directory as defined in our routes.js (config)
  // We should be able to use this to access files from any directory provided we specify the directory in routes.js
  get: function (req, res) {
    console.log(req.path);
    console.log(req.path.substr(1));
    res.sendfile(req.path.substr(1));
  },

  // This allows a user to retrieve all of his/her files from the DB
  index: function (req, res) {
    console.log(req.params.all())
  
    // Lets grab all the user's files form the DB based on the file type supplied in the GET request 
    // Takes in a url like '/file/index/54?fileType=image'
    File.find()
      .where({ user_id: req.param('id')})
      .where({ file_type: req.param('fileType') })
      //.limit(100)
      .sort('createdAt')
      .exec(function(err, files) {
        if(err) res.send(500);
        else {
          res.json(files);
        }
    });
  },


  _config: {
    rest: false,
    shortcuts: false
  }
};
