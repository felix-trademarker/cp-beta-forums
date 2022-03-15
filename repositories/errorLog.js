let _table = process.env.TBLEXT + "error_logs";
let conn = require('../config/DbConnect');

let ObjectID = require('mongodb').ObjectID;

let moment = require('moment');

// dirty connection MYSQL



module.exports = {

    put: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
		function(err, res2) {
			if (err) throw err;
		});

	},
	
};