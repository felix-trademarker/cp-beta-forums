let tableName = "course_contents";
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

	getSQL : async function(page,limit){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM " + tableName
            sql += " LIMIT " + limit
			sql += " OFFSET " + (page -1) * limit
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getCourse : async function(v3id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM " + tableName
            sql += " WHERE v3_id='" + v3id +"'"
			sql += " ORDER BY displaysort ASC"
			sql += " LIMIT 1"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getCourseContents : async function(course){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT c.v3_id as v3Id, c.title, c.slug, c.image, c.hash_code, cc.course_id as courseId FROM " + tableName+ " as cc"
            sql += " INNER JOIN contents as c ON c.v3_id=cc.v3_id"
            sql += " WHERE cc.course_id='" + course.course_id +"'"
			sql += " and cc.v3_id <> '"+course.v3_id+"'"
			sql += " ORDER BY displaysort ASC"
			sql += " LIMIT 2"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    }
    
}

