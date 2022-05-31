let rpoContents = require('../repositories/mysql/_contents');
let rpoUsers = require('../repositories/mysql/_users');
let rpoUserOptions = require('../repositories/mysql/_user_options');
let rpoUserAddresses = require('../repositories/mysql/_user_addresses');
let rpoUserSettings = require('../repositories/mysql/_user_settings');
let rpoUserVocabulary = require('../repositories/mysql/_user_vocabulary');
let rpoUserPreferences = require('../repositories/mysql/_user_preferences');

let rpoLessonsources = require('../repositories/awsLessonSources');
let rpoLessonsourcesMongo = require('../repositories/lessonSources')

let rpoMigrations = require('../repositories/mysql/_migrations');
let moment = require('moment');

exports.contents = async function(req, res, next) {

    let lastMigrated = await rpoMigrations.getLastMigrate('contents')
    let page = 1, limit = 10, offset = 0;

    if (lastMigrated.length > 0) {
        page = lastMigrated[0].page + 1
        limit = lastMigrated[0].limit
    }

    let migrationData = {
        obj : 'contents',
        page: page,
        limit: limit,
        created_at : moment().format()
    }

    await rpoMigrations.put(migrationData)

    let contents = await rpoContents.getSQL(page,limit)
    
    // push to mongoDB
    await contents.forEach(async items => {
        let dupl = await rpoContents.findQuery({content_id:items.content_id})
        console.log("== validating "+items.title+" ==");
        if(dupl.length <= 0) {
            // fetch other data
            // console.log("Fetching content series, rates and comments");
            await rpoContents.put(items)
        }
    })

    console.log("==MIGRATING PAGE "+page+ " OF " +"CONTENTS ==")
 
}

exports.default = async function(table) {

    try {
        let rpo = require("../repositories/mysql/_"+table)
        let lastMigrated = await rpoMigrations.getLastMigrate(table)
        let page = 1, limit = 10, offset = 0;

        // console.log("last migrated", lastMigrated);
        if (lastMigrated.length > 0) {
            page = lastMigrated[0].page + 1
            limit = lastMigrated[0].limit
        }

        let migrationData = {
            obj : table,
            page: page,
            limit: limit,
            created_at : moment().format()
        }

        
        let contents = await rpo.getSQL(page,limit)
        // console.log(contents.length);
        if(contents.length > 0) {
            
            await rpoMigrations.put(migrationData)

            await contents.forEach(async items => {
                let dupl = await rpo.findQuery({id:items.id})
    
                if(dupl.length <= 0) {
                    await rpo.put(items)
                }
            })

            console.log("==MIGRATING PAGE "+page+ " OF " + table +"==")
        } else {
            console.log(">>>>> Stop Migration "+ table);
        }
        
    } catch (err) {
        console.log(err)
        console.log("Can't Find repository ")
    }

    

 
}


exports.users = async function(req, res, next) {

    let objVersions = "users-v4-3-24-2022"

    let lastMigrated = await rpoMigrations.getLastMigrate(objVersions)
    let page = 1, limit = 10, offset = 0;

    if (lastMigrated.length > 0) {
        page = lastMigrated[0].page + 1
        limit = lastMigrated[0].limit
    }

    let migrationData = {
        obj : objVersions,
        page: page,
        limit: limit,
        created_at : moment().format()
    }

    

    let users = await rpoUsers.getSQL(page,limit)

    if (users.length > 0) {
        
        // push to mongoDB
        await users.forEach(async user => {

            let dupl = await rpoUsers.findQuery({id:user.id})
            console.log("== validating "+user.name+" ==");

            // fetch other data | user_options | user_addresses
            let addresses = await rpoUserAddresses.getUserData(user.id)
            user.addresses = addresses

            let userOptions = await rpoUserOptions.getUserData(user.id)
            user.userOptionsData = userOptions

            let userSettings = await rpoUserSettings.getUserData(user.id)
            user.userSettings = userSettings

            let userVocabulary = await rpoUserVocabulary.getUserData(user.id)
            user.userVocabulary = userVocabulary

            let userPreferences = await rpoUserPreferences.getUserData(user.id)
            user.userPreferences = userPreferences

            if(dupl.length <= 0 ) {
                console.log("**************** Added new record ********************");
                await rpoUsers.put(user)
            } else {
                let userId = user.id
                delete user.id
                console.log("**************** Updated record ********************");
                await rpoUsers.update(userId,user)

            }

            
        })

        await rpoMigrations.put(migrationData)

    }
    
    

    console.log("==MIGRATING PAGE "+page+ " OF " +"USERS ==")
 
}

exports.lessonsources = async function() {
    let lessonsources = await rpoLessonsources.get()
    console.log("lessonsources",lessonsources.length);
    for (let i=0; i < lessonsources.length; i++){
        let lesson = lessonsources[i]
        lesson.v3_id = lesson._id
        delete lesson._id
        let found = await rpoLessonsourcesMongo.findQuery({v3_id: lesson.v3_id})
        if (!found.length) {
            rpoLessonsourcesMongo.put(lesson)
            console.log("add v3Id", lesson.v3_id);
        }
        
    }
}