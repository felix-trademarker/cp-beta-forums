let rpoContents = require('../repositories/mysql/_contents');
let rpoContentsMerged = require('../repositories/mysql/contentMerged');
let rpoUsers = require('../repositories/mysql/_users');
let rpoUserOptions = require('../repositories/mysql/_user_options');
let rpoUserAddresses = require('../repositories/mysql/_user_addresses');
let rpoUserSettings = require('../repositories/mysql/_user_settings');
let rpoUserVocabulary = require('../repositories/mysql/_user_vocabulary');
let rpoUserPreferences = require('../repositories/mysql/_user_preferences');

let rpoLessonsources = require('../repositories/awsLessonSources');
let rpoLessonsourcesLocal = require('../repositories/lessonSourcesLocal');
let rpoLessonsourcesMongo = require('../repositories/lessonSources')
let rpoDailyMotion = require('../repositories/videosDailyMotion')

let rpoMigrations = require('../repositories/mysql/_migrations');
let moment = require('moment');
// const { delete } = require('../app');

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

exports.content2 = async function(req, res, next) {

    // let loc = []
    // loc['test'] = {
    //     value: 'asdasd'
    // }

    // let items = {
    //     locations : loc
    // }

    // await rpoContentsMerged.put(items)

    // return;

    let lastMigrated = await rpoMigrations.getLastMigrate('contentSource8')
    let page = 1, limit = 1000, offset = 0;

    if (lastMigrated.length > 0) {
        page = lastMigrated[0].page + 1
        limit = lastMigrated[0].limit
    }

    let migrationData = {
        obj : 'contentSource8',
        page: page,
        limit: limit,
        created_at : moment().format()
    }

    

    let contents = await rpoContentsMerged.getSQLQueryContents(page,limit)
    
    // console.log(contents);
    // push to mongoDB
    if (contents && contents.length > 0) {
        for (let cnt=0; cnt < contents.length; cnt++ ) { let items = contents[cnt]
    // await contents.forEach(async items => {

            if (items.v3_id) {

                let dupl = await rpoContentsMerged.findQuery({content_id:items.content_id})
                console.log("== validating "+items.title+" ==");
                if(dupl.length <= 0) {
                    
                    // TRANSFORM MP3 LINK
                    if (items.mp3_public.includes("https")) {
                        items.mp3_public = items.mp3_public
                    } else {
                        if (items.mp3_public)
                        items.mp3_public = "https://s3contents.chinesepod.com/"+ items.v3_id + "/" + items.hash_code +"/"+ items.mp3_public
                    }

                    // TRANSFORM IMAGE LINK
                    if (items.image.includes("https")) {
                        items.image = items.image
                    } else {
                        items.image = "https://s3contents.chinesepod.com/"+ items.v3_id + "/" + items.hash_code +"/"+ items.image
                    }

                    let location = {};
                    let source = await rpoLessonsourcesLocal.findQuery({v3_id:items.v3_id})

                    
                    if (source && source.length > 0) {
                        // items.videos = {}
                        // console.log(" ============== FOUND SOURCE ===============");
                        // if (source[0].youtube) items.videos.youtube = source[0].youtube
                        // if (source[0].wistia) items.videos.wistia = source[0].wistia
                        // if (source[0].vimeo) items.videos.vimeo = source[0].vimeo
                        // if (source[0].podcast) items.videos.podcast = source[0].podcast
                        // if (source[0].dialogue) items.videos.dialogue = source[0].dialogue
                        // if (source[0].review) items.videos.review = source[0].review
                        // if (source[0].recap) items.videos.recap = source[0].recap

                        
            
                            
                        console.log("*****************************has videos");
                        if (source[0].youtube && source[0].youtube.simplified) 
                            location.youtube = source[0].youtube.simplified
                        if (source[0].youtube && source[0].youtube.traditional) 
                            location.youtubeTrad = source[0].youtube.traditional
        
                        if (source[0].wistia && source[0].wistia.simplified) 
                            location.wistia = source[0].wistia.simplified
                        if (source[0].wistia && source[0].wistia.traditional) 
                            location.wistiaTrad = source[0].wistia.traditional
        
                        if (source[0].vimeo && source[0].vimeo.simplified) 
                            location.vimeo = source[0].vimeo.simplified
                        if (source[0].vimeo && source[0].vimeo.traditional) 
                            location.vimeoTrad = source[0].vimeo.traditional
        
                        if (source[0].podcast && source[0].podcast.simplified) 
                            location.podcast = source[0].podcast.simplified
                        if (source[0].podcast && source[0].podcast.traditional) 
                            location.podcastTrad = source[0].podcast.traditional
        
                        if (source[0].dialogue && source[0].dialogue.simplified) 
                            location.dialogue = source[0].dialogue.simplified
                        if (source[0].dialogue && source[0].dialogue.traditional) 
                            location.dialogueTrad = source[0].dialogue.traditional
        
                        if (source[0].review && source[0].review.simplified) 
                            location.review = source[0].review.simplified
                        if (source[0].review && source[0].review.traditional) 
                            location.reviewTrad = source[0].review.traditional
        
                        if (source[0].recap && source[0].recap.simplified) 
                            location.recap = source[0].recap.simplified
                        if (source[0].recap && source[0].recap.traditional) 
                            location.recapTrad = source[0].recap.traditional
    
                    }

                    let dailyMotions = await rpoDailyMotion.findQuery({v3_id:items.v3_id})
                    if (dailyMotions && dailyMotions.length > 0) {
                        let motionUrlArr = dailyMotions[0].url.split('/')
                        let motionId = motionUrlArr[motionUrlArr.length - 1]
                        console.log("=== found daily motion");
                        if (motionId)
                        location.dailyMotion = motionId
                    }

                    // if (location && location.length > 0) {
                        
                    // }
                    items.locations = location
                    console.log(location);
                    await rpoContentsMerged.put(items)
                }
            }
        }
    } else {
        console.log("*** STOP NOW ***");
    }

    await rpoMigrations.put(migrationData)

    console.log("==MIGRATING PAGE "+page+ " OF " +"CONTENTS ==")
 
}

exports.updateLessonContents = async function() {
    let lastMigrated = await rpoMigrations.getLastMigrate('lessonContentUpdates3')
    let page = 1, limit = 2000, offset = 0;

    if (lastMigrated.length > 0) {
        page = lastMigrated[0].page + 1
        limit = lastMigrated[0].limit
    }

    let migrationData = {
        obj : 'lessonContentUpdates3',
        page: page,
        limit: limit,
        created_at : moment().format()
    }

    let contents = await rpoContentsMerged.getContentsPager(page,limit)

    if (contents && contents.length > 0) {
        let counter = 0;
        contents.forEach(async function(items){
            console.log("reading %s %d", items.v3_id,counter++);
            let item = items
            let location = [];

            

            if (items.videos) {
                // modify or leave

                
                console.log("*****************************has videos");
                if (items.videos && items.videos.youtube && items.videos.youtube.simplified) 
                    location['youtube'] = items.videos.youtube.simplified
                if (items.videos && items.videos.youtube && items.videos.youtube.traditional) 
                    location['youtubeTrad'] = items.videos.youtube.traditional

                if (items.videos && items.videos.wistia && items.videos.wistia.simplified) 
                    location['wistia'] = items.videos.wistia.simplified
                if (items.videos && items.videos.wistia && items.videos.wistia.traditional) 
                    location['wistiaTrad'] = items.videos.wistia.traditional

                if (items.videos && items.videos.vimeo && items.videos.vimeo.simplified) 
                    location['vimeo'] = items.videos.vimeo.simplified
                if (items.videos && items.videos.vimeo && items.videos.vimeo.traditional) 
                    location['vimeoTrad'] = items.videos.vimeo.traditional

                if (items.videos && items.videos.podcast && items.videos.podcast.simplified) 
                    location['podcast'] = items.videos.podcast.simplified
                if (items.videos && items.videos.podcast && items.videos.podcast.traditional) 
                    location['podcastTrad'] = items.videos.podcast.traditional

                if (items.videos && items.videos.dialogue && items.videos.dialogue.simplified) 
                    location['dialogue'] = items.videos.dialogue.simplified
                if (items.videos && items.videos.dialogue && items.videos.dialogue.traditional) 
                    location['dialogueTrad'] = items.videos.dialogue.traditional

                if (items.videos && items.videos.review && items.videos.review.simplified) 
                    location['review'] = items.videos.review.simplified
                if (items.videos && items.videos.review && items.videos.review.traditional) 
                    location['reviewTrad'] = items.videos.review.traditional

                if (items.videos && items.videos.recap && items.videos.recap.simplified) 
                    location['recap'] = items.videos.recap.simplified
                if (items.videos && items.videos.recap && items.videos.recap.traditional) 
                    location['recapTrad'] = items.videos.recap.traditional
            }

            // find daily motion video if found add in list
            let dailyMotions = await rpoDailyMotion.findQuery({v3_id:item.v3_id})
            if (dailyMotions && dailyMotions.length > 0) {
                let motionUrlArr = dailyMotions[0].url.split('/')
                let motionId = motionUrlArr[motionUrlArr.length - 1]
                console.log("=== found daily motion");
                if (motionId)
                location['dailyMotion'] = motionId
            }

            // update record
            if (location && location.length > 0) {
                item.locations = location
                console.log("=== update ===", item.v3_id);
                delete item._id
                delete item.videos
                await rpoContentsMerged.update(items._id, item)

                return;
            }

        })

        // save migration data
        // await rpoMigrations.put(migrationData)
    }
    // console.log("migration page: ", page);
    // await rpoMigrations.put(migrationData)
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
        // insert new source record
        if (!found.length) {

            let sources = await 

            rpoLessonsourcesMongo.put(lesson)
            console.log("add v3Id", lesson.v3_id);
        }

        let lessonContent = await rpoContents.findQuery({v3_id: lesson.v3_id})
        if (lessonContent.length) {
            rpoContents.update(lessonContent[0]._id, { source: lesson })
            console.log("add v3Id", lesson.v3_id);
        }
    }
}