/**
 * UploadController
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

var sid = require('shortid');
var fs = require('fs');
var mkdirp = require('mkdirp');
var mime = require('mime'); //used for determining the file type of each file based on the extension
//var io = require('socket.io');
var gm = require('gm')
  , imageMagick = gm.subClass({ imageMagick: true });

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
 
// Where you would do your processing, etc
// Stubbed out for now
function processImage(id, name, path, thumbnailPath, cb) {
  console.log('Processing image');
  console.log("id: " + id + "; filePath: " + path + "; thumbnailFilePath: " + thumbnailPath)
  //generate a thumbnail for the image
  imageMagick(path).thumb(170, 110, thumbnailPath, 50, function(err, stdout, stderr, command){
    if (err) {
      console.log(err);
      console.log(stdout);
      console.log(stderr);
      console.log(command);
    }
    else console.log("wrote thumbnail")
 
    cb(null, {
      'result': 'success',
      'id': id,
      'name': name,
      'path': path
    });
   });
}
 
 
module.exports = {
  upload: function (req, res) {
    console.log(req.files);
    var file = req.files.file; //req.files.userPhoto
    console.log("file: ")
    console.log(file)
    var id = sid.generate(),
      fileName = id + "." + fileExtension(safeFilename(file.name)),
      dirPath = UPLOAD_PATH + '/' + req.session.authStatus.id + '/images',
      thumbnailDirPath = UPLOAD_PATH + '/' + req.session.authStatus.id + '/images/thumbnails',
      filePath = dirPath + '/' + fileName,
      thumbnailFilePath = dirPath + '/thumbnails/' + fileName;

    console.log("file object:")
    console.log(file);
 
    try {
      mkdirp.sync(dirPath, 0755);
      mkdirp.sync(thumbnailDirPath, 0755);
    } catch (e) {
      console.log(e);
    }
 
    fs.readFile(file.path, function (err, data) {
      //console.log(data);
      if (err) {
        res.json({'error': 'could not read file'});
      } else {
        fs.writeFile(filePath, data, function (err) {
          if (err) {
            res.json({'error': 'could not write file to storage'});
          } else {
            
            processImage(id, fileName, filePath, thumbnailFilePath, function (err, data) {

              //console.log("processImage data:")

              // By default mime.lookup spits out 'image/png' or 'image/jpg' for image files
              // However, we want just 'image' for image files so the following 2 lines accomplish this
              if(mime.lookup(fileName).split('/')[0] === "image") var fileType = "image";
              else var fileType = mime.lookup(fileName);

              imageMagick(filePath).filesize(function(err, filesize){
                imageMagick(thumbnailFilePath).filesize(function(err, thumbfilesize){
                  // Let's create an entry in the file table in postgres that we can associate with a user within the user table
                  File.create({  
                                user_id: req.session.req.session.authStatus.id, // This is the user foreign-key
                                file_name: fileName,
                                file_path: filePath,
                                file_type: fileType,
                                file_thumb_path: thumbnailFilePath,
                                file_size: filesize,
                                file_thumb_size: thumbfilesize
                              }, function(err, file) {
                                  if (err) res.send(500);
                                  else res.json(file)
                                  console.log("file entry created in DB");
                              });
                  //console.log(data);
                  });
                });
              });


          }
        })
      }
    });
  },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GifController)
   */
  _config: {}
};
