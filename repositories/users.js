let _table = process.env.TBLEXT + "users";
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

    // ADD CUSTOM FUNCTION BELOW ========================
    // ==================================================

	findEmail : async function(email) {
		return new Promise(function(resolve, reject) {

			let query = { email: email };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

}