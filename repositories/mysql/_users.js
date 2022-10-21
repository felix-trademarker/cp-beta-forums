let tableName = "users";
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

var conCpodLogging = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: "chinesepod_logging",
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

    getUserByEmailSQL : async function(email){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM " + tableName
            sql += " WHERE email='" + email+"'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserByIdSQL : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            id, 
                            username, 
                            email, 
                            code as hashCode, 
                            name,
                            nationality,
                            country,
                            city,
                            avatar_url as avatarUrl,
                            interests,
                            skyper,
                            sex,
                            birthday,
                            mailing_address1 as mailingAddress1,
                            mailing_address2 as mailingAddress2,
                            mailing_city as mailingCity,
                            mailing_state as mailingState,
                            mailing_country as mailingCountry,
                            mailing_postal_code as mailingPostalCode,
                            mobile_phone as mobileNumber,
                            credit_amount as creditAmount
                        FROM ${tableName}
                        WHERE id=${id}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserBySession : async function(sesIs){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT u.* FROM sessions AS s"
            sql += " LEFT JOIN users AS u"
            sql += " ON s.session_user_id=u.id"
            sql += " WHERE session_id='" + sesIs+"'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    // GET USER COURSE
    getUserCourse : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT
                        c.course_id as courseId, 
                        c.ams_course_id as amsCourseId, 
                        c.course_title as courseTitle, 
                        c.channel_id as channelId, 
                        c.type as type, 
                        c.course_introduction as courseIntroduction, 
                        c.course_hightlight as courseHightlight, 
                        c.publish_time as publishTime, 
                        c.course_image as courseImage, 
                        c.level_id as levelId, 
                        c.create_time as createTime, 
                        c.update_time as updateTime, 
                        c.created_by as createdBy, 
                        c.updated_by as updatedBy, 
                        c.is_private as isPrivate, 
                        c.pubstatus as pubstatus, 
                        c.course_type as courseType, 
                        c.hash_code as code, 
                        c.org_id as orgId, 
                        c.closed as closed, 
                        c.order_id as orderId, 
                        c.publish_from as publishFrom, 
                        c.publish_to as publishTo
                        FROM course_detail AS c
                        LEFT JOIN user_courses AS uc
                        ON uc.course_id = c.course_id
                        WHERE uc.user_id=${id}`
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserAddress : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM user_addresses"
            sql += " WHERE user_id='" + id+"'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserShippingInfo : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM user_shipping_info"
            sql += " WHERE user_id='" + id+"'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserContents : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT c.title, c.v3_id as lessonId, uc.status FROM contents c"
            sql += " LEFT JOIN user_contents AS uc"
            sql += " ON uc.v3_id = c.v3_id"
            sql += " WHERE uc.user_id='" + id+"'"
            sql += " AND uc.status <> ''"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserOptions : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT option_key as optionKey, option_value as optionValue FROM user_options"
            sql += " WHERE user_id='" + id+"'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserSettings : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                        id,
                        updated_at as updatedAt, 
                        setting as setting, 
                        im_type as imType, 
                        im_address as imAddress, 
                        im_status as imStatus, 
                        subscribe_status as subscribeStatus, 
                        first_show as firstShow, 
                        autoplay_sec as autoplaySec, 
                        dashboard_tip as dashboardTip, 
                        group_tip as groupTip
                        FROM user_settings
                        WHERE user_id=${id}`
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserVocabulary : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT v.vocabulary_class as vocabularyClass, v.column_1 as simplified, v.column_2 as pinyin, v.column_3 as english, v.column_4 as traditional, v.audio, v.v3_id as v3Id, v.display_order as displayOrder, v.image, vt.id as tagId ,vt.tag FROM vocabulary v"
            sql += " LEFT JOIN user_vocabulary AS uv"
            sql += " ON uv.vocabulary_id = v.id"
            sql += " LEFT JOIN user_vocabulary_to_vocabulary_tags AS uvtvt"
            sql += " ON uv.vocabulary_id = uvtvt.user_vocabulary_id"
            sql += " INNER JOIN vocabulary_tags AS vt"
            sql += " ON vt.id = uvtvt.vocabulary_tag_id"
            sql += " WHERE uv.user_id='" + id+"'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserSubscriptions : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                        subscription_id as subscriptionId,
                        subscription_from as subscriptionFrom,
                        subscription_type as subscriptionType,
                        is_old as isOld,
                        product_id as productId,
                        product_length as productLength,
                        status,
                        receipt,
                        date_cancelled as dateCancelled,
                        date_created as dateCreated,
                        next_billing_time as nextBillingTime,
                        last_modified as lastModified,
                        cc_num as ccNum,
                        cc_exp as ccExp,
                        paypal_email as paypalEemail
                        FROM subscriptions
                        WHERE user_id=${id}`
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserPost : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT
                        id, 
                        content, 
                        created_at as createdAt, 
                        published, 
                        title, 
                        is_draft as isDraft, 
                        last_comment_id as lastCommentId, 
                        last_comment_time as lastCommentTime, 
                        group_id as groupId 
                        FROM user_posts
                        WHERE user_id=${id}`
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserPostTags : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT upt.tag FROM user_posts_to_user_post_tags ptu"
            sql += " LEFT JOIN user_post_tags AS upt"
            sql += " ON upt.id = ptu.tag_id"
            sql += " WHERE ptu.tag_id='" + id +"'"
            sql += " AND upt.tag<>''"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserGroups : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                        g.group_name as groupName, 
                        g.group_desc as groupDesc, 
                        g.group_type as groupType, 
                        g.group_icon as groupIcon, 
                        g.group_creator as groupCreator, 
                        g.group_announce as groupAnnounce, 
                        g.is_private as isPrivate, 
                        g.created_at as createdAt, 
                        g.updated_at as updatedAt, 
                        g.created_by as createdBy, 
                        g.post_count as postCount, 
                        g.unread_count as unreadCount, 
                        g.user_count as userCount, 
                        g.grouptype_id as grouptypeId, 
                        g.level, 
                        g.lang, 
                        g.is_deleted as isDeleted, 
                        g.usertype, 
                        g.is_active as isActive, 
                        g.max_number as maxNumber, 
                        g.start_date as startDate, 
                        g.end_date as endDate, 
                        g.class_time as classTime, 
                        g.group_city as groupCity, 
                        g.group_province as groupProvince, 
                        g.group_country as groupCountry, 
                        g.founder, 
                        g.update_by as updateBy, 
                        g.group_slug as groupSlug, 
                        g.school_id as schoolId
                        FROM groups as g
                        LEFT JOIN user_groups AS ug
                        ON ug.group_id = g.group_id
                        WHERE ug.user_id=${id}`
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserNotes : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT note, created_at as createdAt, created_by as createdBy, updated_at as updatedAt FROM user_notes"
            sql += " WHERE user_id='" + id +"'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserFeeds : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM user_feeds"
            sql += " WHERE user_id='" + id +"'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserEmailLogs : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                        email_id as emailId,  
                        email_send_id as emailSendId,  
                        opens,  
                        clicks,  
                        createdAt  
                        FROM email_logs
                        WHERE user_id='${id}'
                        ORDER BY createdAt DESC`
            conCpodLogging.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserLessonTracks : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                        v3_id as v3Id,  
                        track_type as trackType,  
                        progress,  
                        source,  
                        timestamp as createdAt,  
                        updated_at as updateddAt  
                        FROM lesson_tracks
                        WHERE user_id='${id}'
                        ORDER BY updated_at DESC`
            conCpodLogging.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },
    
    getUserDailyStats : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            lessons_studied as lessonStudied,
                            tests_taken as testTaken,
                            average_score as averageScore,
                            average_last_score as averageLastScore,
                            time_spent as timeSpent,
                            date as date,
                            createdAt as createdAt
                        FROM user_daily_stats
                        WHERE user_id='${id}'
                        
                        ORDER BY createdAt DESC
                        LIMIT 10`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    userLastVisit : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            url,
                            time
                        FROM user_log
                        WHERE user_id='${id}'
                        ORDER BY time DESC
                        LIMIT 10`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUsersList : async function(limit,offset){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            id
                        FROM ${tableName}
                        LIMIT ${limit}
                        OFFSET ${offset}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUsersDictionaries : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            DISTINCT(word),
                            ip,
                            search_time as searchTime
                        FROM dictionary_search
                        WHERE user_id='${id}'
                        ORDER BY search_time DESC`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },
    
    getUserRole : async function(roleId){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            *
                        FROM roles
                        WHERE id='${roleId}'`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserSchool : async function(schoolId){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            *
                        FROM school
                        WHERE school_id='${schoolId}'`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserAge : async function(ageId){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            *
                        FROM ages
                        WHERE id='${ageId}'`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserActions : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            ua.display_status as displayStatus,
                            ua.action_display as actionDisplay,
                            uat.id as actionTypeId,
                            uat.parent_id as actionTypeParentId,
                            uat.type_name as actionTypeName,
                            uat.type_image as actionTypeImage,
                            uat.type_format_description as actiondescription,
                            ua.action_time as actionTime
                        FROM user_action ua
                        LEFT JOIN user_action_type uat
                        ON ua.action_type_id=uat.id
                        WHERE ua.user_id='${id}'`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserCampaign : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            code,
                            campaign_params as params,
                            created
                        FROM user_campaigns
                        WHERE user_id='${id}'`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserOrder : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            o.product_id as productId,
                            o.product_type as productType,
                            o.promo_code as promoCode,
                            o.payment,
                            o.billed_amount as billedAmount,
                            o.pay_status as payStatus,
                            o.pay_method as payMethod,
                            o.action_type as actionType,
                            o.finished,
                            o.start_date as startDate,
                            o.end_date as endDate,
                            o.created_at as createdAt,
                            o.updated_at as updatedAt,
                            o.notes,
                            ot.order_type as orderType,
                            p.name as promoName,
                            p.code as promoCode
                        FROM orders o
                        LEFT JOIN order_type ot
                        ON ot.order_id=o.id
                        LEFT JOIN orders_to_promotions otp
                        ON otp.order_id=o.id
                        LEFT JOIN promotions p
                        ON p.id=otp.promotion_id
                        WHERE o.user_id='${id}'`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },
    
}