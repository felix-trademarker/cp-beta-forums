let tableName = "contents";
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

    getSQLQuery : async function(page,limit){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                            course_id,
                            cc.v3_id,
                            course_content_id,
                            displaysort,
                            content_id,
                            popularity,
                            rank,
                            slug,
                            type,
                            theme,
                            title,
                            introduction,
                            level,
                            hash_code,
                            time_offset,
                            image,
                            transcription1,
                            mp3_public,
                            video 
                        from course_contents as cc 
                        INNER JOIN contents as c ON cc.v3_id = c.v3_id`
            sql += " LIMIT " + limit
			sql += " OFFSET " + (page -1) * limit
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getSQLQueryContents : async function(page,limit){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                            
                        from contents`
            sql += " LIMIT " + limit
			sql += " OFFSET " + (page -1) * limit
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getContentSlug : async function(slug){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM " + tableName
            sql += " WHERE slug='" + encodeURIComponent(slug) + "'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getContentV3 : async function(v3Id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM " + tableName
            sql += " WHERE v3_id='" + v3Id + "'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    }
    
}