/**
 * Global adapter config
 * 
 * The `adapters` configuration object lets you create different global "saved settings"
 * that you can mix and match in your models.  The `default` option indicates which 
 * "saved setting" should be used if a model doesn't have an adapter specified.
 *
 * Keep in mind that options you define directly in your model definitions
 * will override these settings.
 *
 * For more information on adapter configuration, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.adapters = {


//format of URL postgres://user:password@host:port/dbname
    'default': 'postgresql',

    postgresql: {
      module: 'sails-postgresql',
      //url: process.env.DB_URL,

      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,

      pool: false,

      schema: true
    }


  // If you leave the adapter config unspecified 
  // in a model definition, 'default' will be used.
  //'default': 'disk',

  // Persistent adapter for DEVELOPMENT ONLY
  // (data is preserved when the server shuts down)
  // disk: {
  //   module: 'sails-disk'
  // },

  // // MySQL is the world's most popular relational database.
  // // Learn more: http://en.wikipedia.org/wiki/MySQL
  // myLocalMySQLDatabase: {

  //   module: 'sails-mysql',
  //   host: 'YOUR_MYSQL_SERVER_HOSTNAME_OR_IP_ADDRESS',
  //   user: 'YOUR_MYSQL_USER',
  //   // Psst.. You can put your password in config/local.js instead
  //   // so you don't inadvertently push it up if you're using version control
  //   password: 'YOUR_MYSQL_PASSWORD', 
  //   database: 'YOUR_MYSQL_DB'
  // }
};