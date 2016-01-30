'use strict';

var Promise = require('bluebird').Promise;
var mongodb = require('mongodb');


Promise.promisifyAll(mongodb.Cursor.prototype);


/**
 * Creates a MongoDB connection. The connection itself is essentially a wrapper
 * for the native Node MongoDB client that defers and wraps the connect action
 * in a function that returns a Promise. As part of the module, the cursor
 * object inherent to the `mongodb` library is wrapped in Promise/A+ compliant
 * functions.
 *
 * @constructor
 * @param {String} url The MongoDB connection string including the protocol,
 *     hostname, and port.
 * @param {Object} [options] An options configuration object;
 */
function PromiseClient(url, options) {
	options = options || {};

	this.url = url;
	this.options = options;

	this._connection = null;
}

PromiseClient.prototype = {
	/**
	 * Connects to the MongoDB located at the URL provided on object
	 * instantiation.
	 *
	 * @returns {Promise} A promise resolved with the MongoDB connection or
	 *     rejected with any connection errors.
	 */
	connect: function PromiseClient$connect() {
		var self = this;

		if (this._connection) {
			return this._connection;
		}

		return this._connection = new Promise(function(resolve, reject) {
			mongodb.MongoClient.connect(self.url, self.options, function(err, db) {
				if (err) {
					reject(err);
				}
				else {
					resolve(db);
				}
			});
		});
	},

	/**
	 * Disconnects the MongoDB client from the active connection.
	 */
	disconnect: function PromiseClient$disconnect() {
		var self = this;

		if (this._connection) {
			this._connection.then(function(db) {
				db.close();
			}).finally(function() {
				self._connection = null;
			});
		}
	}
};


mongodb.PromiseClient = PromiseClient;


module.exports = mongodb;
