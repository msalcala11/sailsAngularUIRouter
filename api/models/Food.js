/**
 * Food
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
  		unique: true
  	},

  	cals: {
  		type: 'integer'
  	}
    
  }

};
