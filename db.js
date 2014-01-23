/**
 * Created by liu.xing on 14-1-23.
 */
var settings = require('./settings');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
module.exports = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {}),{w:1});