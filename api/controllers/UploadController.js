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
//var io = require('socket.io');
 
var UPLOAD_PATH = 'public/images';
 
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
function processImage(id, name, path, cb) {
  console.log('Processing image');
 
  cb(null, {
    'result': 'success',
    'id': id,
    'name': name,
    'path': path
  });
}
 
 
module.exports = {
  upload: function (req, res) {
    console.log(req.files);
    var file = req.files.file, //req.files.userPhoto
      id = sid.generate(),
      fileName = id + "." + fileExtension(safeFilename(file.name)),
      dirPath = UPLOAD_PATH + '/' + id,
      filePath = dirPath + '/' + fileName;

    console.log("file object:")
    console.log(file);
 
    try {
      mkdirp.sync(dirPath, 0755);
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
            processImage(id, fileName, filePath, function (err, data) {
              //console.log("processImage data:")
              console.log(data);
              if (err) {
                res.json(err);
              } else {
                res.json(data);
              }
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
