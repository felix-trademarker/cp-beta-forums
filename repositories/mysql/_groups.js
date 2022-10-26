let tableName = "groups";
let _table = tableName;
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

    getGroup : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            g.group_id as groupId,
                            g.group_name as groupName,
                            g.group_desc as groupDesc,
                            g.group_icon as groupIcon,
                            g.group_creator as groupCreator,
                            g.group_announce as groupAnnounce,
                            g.is_private as isPrivate,
                            g.post_count as postCount,
                            g.unread_count as unreadCount,
                            g.user_count as userCount,
                            gt.name as grouptype,
                            g.level,
                            g.lang,
                            g.is_deleted as isDeleted,
                            g.usertype as userType,
                            g.is_active as isActive,
                            g.max_number as maxNumber,
                            g.start_date as startDate,
                            g.end_date as endDate,
                            g.class_time as classTime,
                            g.group_city as groupCity,
                            g.group_province as groupProvince,
                            g.group_country as groupCountry,
                            g.founder as founder,
                            g.update_by as updateBy,
                            g.group_slug as groupSlug,
                            g.school_id as schoolId,
                            g.created_by as createdBy,
                            g.created_at as createdAt,
                            g.updated_at as updatedAt
                        FROM ${tableName} g
                        LEFT JOIN grouptypes gt
                        ON gt.id=g.grouptype_id
                        WHERE group_id=${id}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getGroupInvites : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            invite_code as inviteCode,
                            invitor_user_id as invitorUserId,
                            email_address as emailAddress,
                            created_at as createdAt,
                            expiry_at as expiryAt
                        FROM groups_invite
                        WHERE group_id=${id}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getGroupContents : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            v3_id as v3Id,
                            type,
                            course_name as courseName,
                            is_active as isActive,
                            is_studied as isStudied,
                            sort,
                            created_at as createdAt,
                            publication_timestamp as publicationTimestamp
                        FROM group_contents
                        WHERE group_id=${id}
                        ORDER BY sort ASC`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    
}