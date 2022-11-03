let tableName = "contentLessons";
let _table = "cp." + tableName;
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

var conAssessment = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: "assessment",
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

    getContentsPager : async function(page, limit) {
		return new Promise(function(resolve, reject) {
			
            conn.getDb().collection(_table)
                .find()
                .sort()
                // .limit(limit)
                // .skip((page -1) * limit)
                .toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

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
                        transcription2,
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

    getContentSlug : async function(slug){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM " + tableName
            sql += " WHERE slug='" + slug + "'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getContentV3 : async function(v3Id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM contents"
            sql += " WHERE v3_id='" + v3Id + "'"
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getRawDialogues : async function(v3Id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM content_dialogues"
            sql += " WHERE v3_id='" + v3Id + "'"
            sql += " Order By display_order ASC "
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },
    
    getRawVocab : async function(v3Id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM vocabulary"
            sql += " WHERE v3_id='" + v3Id + "'"
            sql += " AND vocabulary_class IN ('Key Vocabulary','Supplementary')"
            sql += " Order By vocabulary_class ASC, display_order ASC "
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getRawExpansion : async function(v3Id){
        return new Promise(function(resolve, reject) {
            var sql = "SELECT vocabulary, row_1, row_2, audio FROM content_expansions"
            sql += " WHERE v3_id='" + v3Id + "'"
            sql += " Order By display_order ASC "
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getLessonComments : async function(v3Id){
        return new Promise(function(resolve, reject) {
            var sql = `select c.id, c.content, c.reply_to_id as replyId, c.reply_to_id_2 as replyId2, c.reply_to_user_id as replyUserId, c.comment_from as commentFrom, c.created_at as createdAt,
            c.user_id as userId, u.username, p.avatar_url as avatarUrl
            from comments c
            left join users u on c.user_id=u.id
            left join user_preferences p on p.user_id=c.user_id
            where c.parent_id = ${v3Id} and c.type = 'lesson'`

            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getGrammar : async function(v3Id){
        return new Promise(function(resolve, reject) {
            var sql = `select * from content_grammar_tag where v3_id = ${v3Id}`

            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getGrammarBlock : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = `select 
                        grammar_block_id as id,
                        description,
                        summary,
                        display_sort as displaySort,
                        grammar_id as grammarId,
                        create_time as createdTime,
                        update_time as updateTime
                        from grammar_block where grammar_id = ${id}`

            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getGrammarExamples : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = `select 
                        grammar_sentence_id as id,
                        grammar_block_id as blockId,
                        target as english,
                        source,
                        source_trad as sourceTraditional,
                        source_annotate as sourceAnnotateSimplified,
                        source_trad_annotate as sourceAnnotateTraditional,
                        source_audio as sourceAudio
                        from grammar_sentence where grammar_block_id = ${id}`

            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getQuestions : async function(id){
        return new Promise(function(resolve, reject) {
            var sql = `select 
                        *
                      from questions 
                      where scope = ${id}
                      and product_id = 1
                      and status = 1`

            conAssessment.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getLessonListIds : async function(limit,offset){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            v3_id
                        FROM contents
                        LIMIT ${limit}
                        OFFSET ${offset}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getDictionaries : async function(limit,offset){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            id,
                            word,
                            times,
                            last_search_time as lastSearchTime,
                            last_comment_id as lastCommentId,
                            last_comment_time as lastCommentTime
                        FROM dictionary
                        LIMIT ${limit}
                        OFFSET ${offset}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getDictionary : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            id,
                            word,
                            times,
                            last_search_time as lastSearchTime,
                            last_comment_id as lastCommentId,
                            last_comment_time as lastCommentTime
                        FROM dictionary
                        WHERE id=${id}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    searchDictionaries : async function(word){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            id,
                            word,
                            times,
                            last_search_time as lastSearchTime,
                            last_comment_id as lastCommentId,
                            last_comment_time as lastCommentTime
                        FROM dictionary
                        WHERE word LIKE '${word}_%'`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },
}