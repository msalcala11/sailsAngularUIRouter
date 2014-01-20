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
var fs = require('fs');

module.exports = {
  // This enables us to access files from the '/public/images/' directory as defined in our routes.js (config)
  // We should be able to use this to access files from any directory provided we specify the directory in routes.js
  get: function (req, res) {
    console.log(req.path);
    console.log(req.path.substr(1));
    var maxAge = 365*24*60*60*1000 //Sets the cache to expire a year from now
    res.setHeader('Cache-Control', "'public, max-age="+maxAge+"'");
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
          console.log(files);
          res.json(files);
        }
    });
  },

  destroy: function (req, res) {
    // First let's destroy the file entry in the DB
    File.destroy(req.param('fileId'), function(err){
      if(err) res.send(500)
      else {

        // Now let's actually delete the file from the server
        // photo url format 'userfiles/:userId/images/photo.png'
        var filepath = 'userfiles/'+req.param('id') + '/' + req.param('fileType') + 's/' + req.param('fileName');
        fs.unlink(filepath, function (err) {
          if (err) res.send(500);
            console.log('successfully deleted ' + filepath);
        });

        if(req.param('fileType') === 'image') {
          var thumbFilePath = 'userfiles/'+req.param('id') + '/' + req.param('fileType') + 's/thumbnails/' + req.param('fileName');
          fs.unlink(thumbFilePath, function (err) {
            if (err) res.send(500);
            console.log('successfully deleted ' + thumbFilePath);
        });
        }

        res.send(200);
      }
    });
  },


  _config: {
    rest: false,
    shortcuts: false
  }
};
