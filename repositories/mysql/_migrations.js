let tableName = "migration";
let _table = "chinesepod_production_" + tableName;
var Model = require('../_model')
var defaultModel = new Model(_table)

let conn = require('../../config/DbConnect');

// MYSQL
var mysql = require('mysql');

var con = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
});




module.exports = {

    // BASE FUNCTIONS LOCATED IN defaultModel
    get : async function() {
        return await defaultModel.get()
    },
    find : async function(id) {
        return await defaultModel.find(id)
	},
	findQuery : async function(query) {
        return await defaultModel.findQuery(query)
	},
	update : async function(id,data) {
        return await defaultModel.update(id,data)
    },
	put : async function(data) {
        return await defaultModel.put(data)
    },
    remove : async function(id) {
        return await defaultModel.remove(id)
    },

    // ADD CUSTOM FUNCTION BELOW ========================
    // ==================================================

	getLastMigrate : async function(obj){
        return new Promise(function(resolve, reject) {

            let query = { obj : obj }
            conn.getDb().collection(_table)
                .find(query)
                .limit(1)
				.sort({"page": -1})
				.toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

            });
            
        });
    }
    
}