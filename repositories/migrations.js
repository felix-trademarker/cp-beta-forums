let _table = "migration.records";
var Model = require('./_model')
var defaultModel = new Model(_table)

let conn = require('../config/DbConnect');
// module.exports = { baseModel.get }
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
	upsert : async function(q,data) {
        return await defaultModel.upsert(q,data)
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
    },

}