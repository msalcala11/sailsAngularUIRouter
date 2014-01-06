/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,

  attributes: {
  	
  	name: {
            type: 'string',
            required: true
    },

    facebook_uid: {
          type: 'string',
    },

    facebook_profile_pic: {
          type: 'string',
    },

    email: {
            type: 'string',
            email: true,
            //required: true,
            unique: true
    },

    admin: {
      type: 'boolean',
      defaultsTo: false
    },

    online: {
      type: 'boolean',
      defaultsTo: false
    },

    encryptedPassword: {
            type: 'string'
    },

    toJSON: function(){
            var obj = this.toObject();
            delete obj.password;
            delete obj.confirmation;
            delete obj.encryptedPassword;
            delete obj._csrf;
            return obj;
    }
    
  },

  beforeCreate: function(values, next) {
    console.log("made it into beforeCreate");
    // This checks to make sure the password and password confirmation match befor creating a record
    // if (!values.password || values.password != values.confirmation) {
    //   return next({err: ["Password doesn't match password confirmation."]});
    // }

    if(values.password){ //if they signed up with facebook, there will be no password, so just call next();
      require('bcrypt').hash(values.password, 10, function passwordEncrypted(err, encryptedPassword) {
        if (err) return next(err);
        values.encryptedPassword = encryptedPassword;
        //values.online = true;
        next();
      });
    } else {
      next(); //if they signed up with facebook, there will be no password, so just call next();
    }
  }


};
