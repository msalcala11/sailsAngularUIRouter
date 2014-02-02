/**
 * UploadController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
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

var sid = require('shortid');
var fs = require('fs');
var mkdirp = require('mkdirp');
var mime = require('mime'); //used for determining the file type of each file based on the extension
//var io = require('socket.io');
// var gm = require('gm')
//   , imageMagick = gm.subClass({ imageMagick: true });
//var im = require('imagemagick');
var cloudinary = require('cloudinary');

// photo url format 'userfiles/:userId/images/photo.png'
var UPLOAD_PATH = 'userfiles';
 
// Setup id generator
sid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
sid.seed(42);
 
function safeFilename(name) {
  name = name.replace(/ /g, '-');
  name = name.replace(/[^A-Za-z0-9-_\.]/g, '');
  name = name.replace(/\.+/g, '.');
  name = name.replace(/-+/g, '-');
  name = name.replace(/_+/g, '_');
  return name;
}
 
function fileMinusExt(fileName) {
  return fileName.split('.').slice(0, -1).join('.');
}
 
function fileExtension(fileName) {
  return fileName.split('.').slice(-1);
}
 
 
module.exports = {
  upload: function (req, res) {
    var file = req.files.file;
    var id = sid.generate(),
      fileName = id + "." + fileExtension(safeFilename(file.name)),
      dirPath = UPLOAD_PATH + '/' + req.session.authStatus.id + '/images',
      cdnPublicId = dirPath + '/' + id;
      
    // Let's upload to our cdn and insert a row in our files table
    cloudinary.uploader.upload(file.path, function(cdnStats) { 
        var filePath = cdnStats.public_id + "." + cdnStats.format

        // Let's generate the RESTful URLs required to request thumbnails of the images we uploaded
        var thumbUrl = cloudinary.url(filePath, { version: cdnStats.version, width: 130, height: 100, crop: 'fit', angle: 'exif' })
        var thumbUrlSecure = cloudinary.url(filePath, { secure: true, version: cdnStats.version, width: 130, height: 100, crop: 'fit', angle: 'exif' })

        // Cloudinary result looks like this:
        // { public_id: 'my_folder/my_name',
        //   version: 1391307185,
        //   signature: '4f7cbf1fc6c720f44230a319dc0e83f3d544486a',
        //   width: 1280,
        //   height: 850,
        //   format: 'jpg',
        //   resource_type: 'image',
        //   created_at: '2014-02-02T02:13:05Z',
        //   bytes: 276749,
        //   type: 'upload',
        //   etag: '73044aba4773b7aae93943d148d89d7d',
        //   url: 'http://res.cloudinary.com/ha7r8ndic/image/upload/v1391307185/my_folder/my_name.jpg',
        //   secure_url: 'https://res.cloudinary.com/ha7r8ndic/image/upload/v1391307185/my_folder/my_name.jpg' }
        // Let's create an entry in the file table in postgres that we can associate with a user within the user table
              File.create({  
                            user_id: req.session.req.session.authStatus.id, // This is the user foreign-key
                            file_name: fileName,
                            file_path: filePath,
                            file_type: cdnStats.resource_type,
                            file_size: cdnStats.bytes,
                            file_cdn_public_id: cdnStats.public_id,
                            file_cdn_version: cdnStats.version,
                            file_cdn_signature: cdnStats.signature,
                            file_format: cdnStats.format,
                            file_cdn_url: cdnStats.url,
                            file_cdn_secure_url: cdnStats.secure_url,
                            file_thumb_cdn_url: thumbUrl,
                            file_thumb_cdn_secure_url: thumbUrlSecure,
                            file_thumb_size: null
                          }, function(err, file) {
                              if (err) res.send(500);
                              else res.json(file)
                              console.log("file entry created in DB");
              });
          },

          {public_id: cdnPublicId, angle: 'exif'}
    );
  },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GifController)
   */
  _config: {}
};