
let rpoUsers158 = require('../repositories/_users158')
let rpoLessonProgressAws = require('../repositories/awsLessonProgress')
let rpoUsersSQL = require('../repositories/mysql/_users')

let rpoMigrations = require('../repositories/migrations')

let moment = require('moment');
const {unserialize} = require('php-serialize');

// temp function to be remove later
exports.migrateRawUser = async function() {

    console.log("=== Checking new users and migrate to mongo158 ===");

    let page = 1
    let limit = 200
    let objVersions = 'usersMailv2' 

    let lastMigrated = await rpoMigrations.getLastMigrate(objVersions)

    // console.log(lastMigrated);

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

    let users = await rpoUsersSQL.getSQLFormatted(page, limit)

    // console.log(users.length);
    if (!users || users.length <= 0) {
        console.log("no record found!");
        return false;
    }


    for (let i=0; i < users.length; i++) { let user = users[i]
        user.mail = await rpoUsersSQL.getUserEmailLogs(user.id)
        await rpoUsers158.upsert({id:user.id},user)
        
        console.log("== migrate user ID:" + user.id +" page " + page +" ==")
    }
    // });
        
    await rpoMigrations.upsert({obj: migrationData.obj},migrationData)

    console.log("####### MIGRATED PAGE "+ page, migrationData);

    // this.migrateRawUser()
}

exports.updateUserEmailLogs = async function() {
    console.log("=== Checking new email logs ===");
    // get last email log
    let totalNumber = await rpoUsersSQL.getUserEmailLogsTotal()
    
    if (totalNumber && totalNumber.length <= 0) return false; 

    let page = 1
    let limit = totalNumber[0].total - 100
    let objVersions = 'emailLogs' 
    let lastMigrated = await rpoMigrations.getLastMigrate(objVersions)

    if (lastMigrated.length > 0) {
        page = lastMigrated[0].page
        limit = lastMigrated[0].limit
    }

    let migrationData = {
        obj : objVersions,
        page: page,
        limit: totalNumber[0].total,
        created_at : moment().format()
    }

    let userIds = await rpoUsersSQL.getUserEmailLogs(limit)

    for (let i=0; i < userIds.length; i++) { 
        
        let userId = userIds[i]
        let users = await rpoUsersSQL.getUserByIdSQL(userId.user_id)

        if (users && users.length > 0) {
            let user = users[0]
            user.mail = await rpoUsersSQL.getUserEmailLogs(userId.user_id)
            await rpoUsers158.upsert({id:user.id},user)

            console.log("UPDATE USER MAIL LOGS", user.id)
        }
        
        
    }


    // // });
        
    await rpoMigrations.upsert({obj: migrationData.obj},migrationData)

    // console.log("####### MIGRATED PAGE "+ page, migrationData);

    // this.migrateRawUser()
}
// USED IN FETCHING USER LESSON PROGRESS
exports.getUserProgress = async function(req) {
    
    let hours = '2'
    let days = 'hours'

    if (req.params.h) {
        hours = req.params.h
    }

    if (req.params.d) {
        days = req.params.d
    }

    let userProgress = await rpoLessonProgressAws.findQuery({updated_at: {$gte : new Date(moment().subtract(hours,days).format())}})
    // console.log(moment().subtract('2','days').format());
    let returnedData = []
    
    if (userProgress && userProgress.length > 0) {
        for (let i=0; i < userProgress.length; i++) {
            let progress = userProgress[i]
            let user = await rpoUsersSQL.getUserByIdSQL(progress.userId)
            user = user && user.length > 0 ? user[0] : null

            progress.user = {
                email: user.email,
                name: user.name,
                username: user.username,
            }

            returnedData.push(progress)
        }
    }

    return returnedData
}

exports.getUserData = async function(id) {
    
  let returnedData = await rpoUsersSQL.getUserByIdSQL(id)

  if (!returnedData || returnedData.length < 1) {
    return [];
  }

  returnedData = (returnedData && returnedData.length > 0 ? returnedData[0] : null)

  returnedData.role = await rpoUsersSQL.getUserRole(returnedData.role_id)
  returnedData.school = await rpoUsersSQL.getUserSchool(returnedData.school_id)
  returnedData.ageRange = await rpoUsersSQL.getUserAge(returnedData.age_id)
  returnedData.userAddresses = await rpoUsersSQL.getUserAddress(id)
  returnedData.userOptions = await rpoUsersSQL.getUserOptions(id)
  returnedData.userSettings = await rpoUsersSQL.getUserSettings(id)
  returnedData.userCourses = await this.getUserCourses(id)
  returnedData.userContents = await rpoUsersSQL.getUserContents(id)
  returnedData.userVocabularies = await rpoUsersSQL.getUserVocabulary(id)
  returnedData.userSubscriptions = await rpoUsersSQL.getUserSubscriptions(id)
  returnedData.userPosts = await this.getUserPost(id)

  returnedData.groups = await rpoUsersSQL.getUserGroups(id)
  returnedData.notes = await rpoUsersSQL.getUserNotes(id)
  let feeds = await rpoUsersSQL.getUserFeeds(id)
    let feedsFormatted=[]
    // unserialize data
    if (feeds && feeds.length > 0)
    for(let f=0; feeds.length > f; f++) {
        let fd = feeds[f]
        let setting = await unserialize(fd.setting)
        feedsFormatted.push(
            {
                setting: {
                    audioType: setting.audio_type,
                    pdfSimplified: setting.pdf,
                    pdfTraditional: setting.pdf_t,
                    audioDg: setting.audio_dg,
                    audioMobile: setting.audio_mobile,
                    audioReview: setting.audio_review,
                    seriesId: setting.series_id,
                },
                archives: fd.archives
            }
        )
        // feeds[f].settings = setting
    }

    if (returnedData.userSettings && returnedData.userSettings.length > 0)
    for (let us=0; us < returnedData.userSettings.length; us++) {
        returnedData.userSettings[us].setting = await unserialize(returnedData.userSettings[us].setting)
    } 

    returnedData.feeds = feedsFormatted
    returnedData.emailLogs = await rpoUsersSQL.getUserEmailLogs(id)
    returnedData.lessonTracks = await rpoUsersSQL.getUserLessonTracks(id)
    returnedData.dailyStats = await rpoUsersSQL.getUserDailyStats(id)
    returnedData.userLastVisit = await rpoUsersSQL.userLastVisit(id)
    returnedData.searchDictionaries = await rpoUsersSQL.getUsersDictionaries(id)
    returnedData.userActions = await rpoUsersSQL.getUserActions(id)
    returnedData.userCampaign = await rpoUsersSQL.getUserCampaign(id)
    returnedData.userOrders = await rpoUsersSQL.getUserOrder(id)

//   console.log(unserialize(returnedData.feeds[0].setting))

    rpoUsers158.upsert({id:returnedData.id},returnedData)

  return returnedData
}

exports.getUserDataLog = async function(id) {
    
    let returnedData = await rpoUsersSQL.searchUser(id)
  
    if (!returnedData || returnedData.length < 1) {
      return [];
    }
  
    returnedData = (returnedData && returnedData.length > 0 ? returnedData[0] : null)
    returnedData.emailLogs = await rpoUsersSQL.getUserEmailLogs(returnedData.id)
    returnedData.userLastVisit = await rpoUsersSQL.userLastVisit(returnedData.id)
    returnedData.lessonTracks = await rpoUsersSQL.getUserLessonTracks(returnedData.id)

  
    return returnedData
}

exports.addUserEmailLog = async function(params) {

    let insertData = {
        user_id: params.userId,
        email_id: params.emailId,
        email_send_id: params.emailSendId,
        opens: 0,
        clicks: 0,
        createdAt: moment().format(),
    }

    let response = await rpoUsersSQL.addUserEmailLogs(insertData)

    return response;
}

exports.getUserCourses = async function(id) {
    
  let returnedData = await rpoUsersSQL.getUserCourse(id)

  // returnedData = (returnedData && returnedData.length > 0 ? returnedData[0] : null)

  // rpoUsers158.upsert({id:returnedData.id},returnedData)

  return returnedData
}

exports.getUserPost = async function(id) {
    
    let returnedData = await rpoUsersSQL.getUserPost(id)

    if (returnedData && returnedData.length > 0) {
        for (let p=0; p < returnedData.length; p++) {
            returnedData[p].tags = await rpoUsersSQL.getUserPostTags(returnedData[p].id)
            // returnedData[p].group = await rpoUsersSQL.getUserGroups(returnedData[p].id)
        }
    }

    return returnedData
  }