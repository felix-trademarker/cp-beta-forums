var rpoTopics = require('../../repositories/topics');
var rpoSubTopics = require('../../repositories/subTopics');
var rpoComments = require('../../repositories/comments');
var rpoHanziDefinitions = require('../../repositories/hanziDefinitions');
var path = require('path')
var helpers = require('../../helpers')
const { toInteger } = require('lodash'); 

let rpoUsersMySQL = require('../../repositories/mysql/_users');
let rpoUsers = require('../../repositories/users');

let mailService = require('../../services/mailService')
let activityService = require('../../services/activityLogService')
let lessonService = require('../../services/lessonService')
let userService = require('../../services/userService')
let orderService = require('../../services/orderService')
let groupService = require('../../services/groupService')

let hanzi = require("hanzi");

exports.fetchSubTopic = async function(req, res, next) {
  let results = await rpoSubTopics.find(req.params.topicId)
  let result = results[0]
  if (result) {
    
    let updateData = {
      viewCount: (result.viewCount ? result.viewCount : 0) + 1
    }
    await rpoSubTopics.update(result._id,updateData)
  }

  console.log(req.params.topicId,"===================",results);

  res.json({results:results[0]});
}

exports.fetchComments = async function(req, res, next) {
  let query = {
    topicId: req.params.topicId,
    deleted_at: { $exists : false }
  }

  let results = await rpoComments.findQuery(query)
  res.json({results:results});
}

exports.findComments = async function(req, res, next) {

  let results = await rpoComments.find(req.params.commentId)
  res.json({results:results[0]});
}

exports.addComments = async function(req, res, next) {

  let data = req.body

  // console.log(data.file);
  if (data.file) {
    data.file = data.file.split(',')
  }

  if (data.replyTo) {
    let results = await rpoComments.find(data.replyTo)
    data.replyToData = results[0]

    // send email notification
    if (data.replyToData.userData) {

      let name = data.replyToData.userData.name.trim().replace(","," ")
      let fname = name.split(" ")
      let firstName = fname.length > 0 ? fname[0] : data.replyToData.userData.username;

      let mailDataAdmin = {
        subject: "ChinesePod Beta Program | " + data.testerName + " replied to your feedback",
        to: data.replyToData.userData.email,
        message: `
          <h3 style="margin-bottom:30px;">Hi ${firstName},</h3>
  
          <p>${data.testerName} replied to your feedback</p>
          <p>${data.message.replace("\n","<br>")}</p>
  
          <p><a href="https://www.chinesepod.com/beta/forums/${data.topicId}">Reply</p>
  
          <br>
          <p>Sincerely,<br>ChinesePod Team</p>
        `
      }
      mailService.defaultSend(mailDataAdmin)
    }
    

  }

  let userData = await helpers.getLoginUser(req)

  activityService.logger(req, "Write a comment");

  data.userData = userData

  data.created_at = req.app.locals.moment().format()

  if (data.message) {
    await rpoComments.put(data)
  }

  

  // Update topic counters
  let topics = await rpoSubTopics.find(data.topicId)
  topics = topics.length > 0 ? topics[0]:null

  if (topics) {

    // console.log("update topics");
    // topics.lastCommentDate = data.created_at

    let comments = await rpoComments.findQuery({topicId:topics._id, deleted_at: {$exists:false} })
    // console.log(comments.length, topics._id)
    // topics.numberOfComments = comments.length

    let topicsData = {
      lastCommentDate: data.created_at,
      numberOfComments: comments.length
    }

    rpoSubTopics.update(topics._id, topicsData)

    let name = topics.userData ? topics.userData.name.trim().replace(","," ") : ''
    let fname = name.split(" ")
    let firstName = fname.length > 0 ? fname[0] : topics.userData.username;

    // send email notification topics has feedback
    let mailDataAdmin = {
      subject: "ChinesePod Beta Program | "+data.testerName+" Added new feedback on your topic",
      to: topics.userData ? topics.userData.email : "felix@bigfoot.com",
      message: `
        <h3 style="margin-bottom:30px;">Hi ${firstName},</h3>

        <p>${data.testerName} leave a feedback on your topic</p>
        <p>${data.message.replace("\n","<br>")}</p>

        <p><a href="https://www.chinesepod.com/beta/forums/${data.topicId}">Reply</p>

        <br>
        <p>Sincerely,<br>ChinesePod Team</p>
      `
    }
    mailService.basicSend(mailDataAdmin)

  }

  res.json({results:true})
}

exports.updateComments = async function(req, res, next) {
  console.log(req.body);

  let commentData = {
    message: req.body.comment,
    updated_at: req.app.locals.moment().format()
  }
  await rpoComments.update(req.body.commentId, commentData)

  res.json({results:true})
}

exports.deleteComments = async function(req, res, next) {
  console.log(req.body);

  // await rpoComments.remove(req.body.commentId)
  let commentData = {
    deleted_at: req.app.locals.moment().format()
  }
  await rpoComments.update(req.body.commentId, commentData)
  let deletedData = await rpoComments.find(req.body.commentId)

  deletedData = deletedData.length > 0 ? deletedData[0] : null
  // console.log(deletedData)

  let repliedComments = await rpoComments.findQuery({replyTo: req.body.commentId})

  if (repliedComments.length > 0) {
    repliedComments.forEach(async function(comment, key){
      let commentData = {
        replyToData : deletedData
      }
      // commentData.replayToData.deleted_at = req.app.locals.moment().format()
      await rpoComments.update(comment._id, commentData)
    })
  }

  // UPDATE TOPIC COUNTERS
  let comments = await rpoComments.findQuery({topicId:deletedData.topicId, deleted_at: {$exists:false} })
  let topicsData = {
    numberOfComments: comments.length
  }
  rpoSubTopics.update(deletedData.topicId, topicsData)

  res.json({results:true})
}

exports.addImageComments = async function(req, res, next) {
  
  console.log("current path", __dirname);
  var file = req.files.file
  var extName = path.extname(file.name)
  var filename = toInteger(req.app.locals.moment().format('YYMMDDHHMMSS')) + '.' + extName;
  filename = filename.toLowerCase()
  uploadPath = __dirname + '/../../public/beta/uploads/comments/'+filename;
  file.mv(uploadPath, function(err) {

    console.log(err);
  });

  res.json({results:filename})
}


exports.getAuth = async function(req, res, next) {
  
  let userData;
  // console.log("body",req.body);
  
  userData = await rpoUsers.findEmail(req.body.email)
  // console.log(userData);
  if (userData.length <= 0) {
      console.log("fetch from mysql");
      userData = await rpoUsersMySQL.getUserByEmailSQL(req.body.email)
      
      // ADD IN MONGO
      if (userData && userData.length > 0) {
          rpoUsers.put(userData[0])
      }
  }

  if (userData.length > 0) {
    userData = userData[0]
  }

  res.cookie('userEmail',userData.email, { maxAge: 900000, httpOnly: true });
  res.cookie('userToken',req.body.token, { maxAge: 900000, httpOnly: true });

  let resData = {
    token: req.body.token,
    isBetaTester:  userData.isBetaTester
  } 

  res.json(resData);
}

exports.getTopics = async function(req, res, next) {
  
  let topics = await rpoTopics.get();
  let selectedTopic = req.params.id

  for(let i=0; i < topics.length; i++) {
    let listSubTopics = await rpoSubTopics.findQuery({ parentName: topics[i].name, status: {$ne : 'draft'}, deleted_at: {$exists : false} })
    topics[i].sub = listSubTopics
    
    if (i == 0 && !selectedTopic) {
      selectedTopic = topics[i].sub[0]._id
    }

  }

  // console.log("this", topics);

  res.json(topics);
}

exports.lookupHanzi = async function(req, res, next) {
  
  try{

  let lookup=[];
  if (req.params.hanzi) {
// check mongo or else fetch definition in hanzi lib
    let hanziDefinition = await rpoHanziDefinitions.findQuery({simplified:req.params.hanzi})

    if (hanziDefinition && hanziDefinition.length > 0) { // found
      lookup = hanziDefinition[0]
      console.log("=====fetch in mongo", req.params.hanzi);

    } else { // fetch in hanzi lib
      hanzi.start();

      if (hanzi.ifComponentExists(req.params.hanzi))
      lookup = hanzi.definitionLookup(req.params.hanzi)

      console.log("=====lookup hanzi library", req.params.hanzi);

      if (lookup && lookup.length > 0) {
        if (lookup[0].definition.includes("surname")) {
          if(lookup.length > 1){
            lookup = lookup[1]
          } else {
            lookup = lookup[0]
          }
        } else {
          lookup = lookup[0]
        }


        // change definition to radical if found
        // let radicalDefinition = hanzi.getRadicalMeaning(lookup.simplified)
        // if(radicalDefinition && radicalDefinition !== "N/A"){
        //   lookup.definition = radicalDefinition
        // }

        // store definition 
        console.log("store hanzi",req.params.hanzi, lookup);
        rpoHanziDefinitions.put(lookup)
      }

      // lookup = lookup[0]

      
      
      
    } // else
    
  }
  lookup.definition = lookup.definition.replaceAll("/", " / ")
  res.json(lookup);
  } catch(err) {
    res.json([]);
  }
}


exports.getLesson = async function(req, res, next) {

  let contents = await lessonService.getLesson(req.params.v3Id)

  res.json(contents);
}

exports.getUserProgress = async function(req, res, next) {

  console.log(req.params);
  let contents = await userService.getUserProgress(req)

  res.json(contents);
}

exports.getUser = async function(req, res, next) {

  // console.log(req.params);
  let contents = await userService.getUserData(req.params.id)

  // console.log(contents);

  res.json(contents);
}

exports.getUserslist = async function(req, res, next) {

  let page = req.params.page ? req.params.page : 1
  let limit = req.params.limit ? req.params.limit : 10
  let users = await rpoUsersMySQL.getUsersList(limit,(page-1) * limit)

  if (!users || users.length < 1) {
    res.json([]);
  }

  let contents = []
  for (let u=0; u < users.length; u++) {
    let content = await userService.getUserData(users[u].id)

    if (content) 
    contents.push(content)
  }

  res.json(contents);
}

exports.getLessonslist = async function(req, res, next) {

  let page = req.params.page ? req.params.page : 1
  let limit = req.params.limit ? req.params.limit : 10
  let lessonIds = await lessonService.getLessonIds(limit,(page-1) * limit)

  if (!lessonIds || lessonIds.length < 1) {
    res.json([]);
  }

  let contents = []
  for (let u=0; u < lessonIds.length; u++) {
    let content = await lessonService.getLesson(lessonIds[u].v3_id)

    if (content) 
    contents.push(content)
  }

  res.json(contents);

}

exports.getDictionaries = async function(req, res, next) {

  let page = req.params.page ? req.params.page : 1
  let limit = req.params.limit ? req.params.limit : 10
  let dictionaries = await lessonService.getDictionaries(limit,(page-1) * limit)

  res.json(dictionaries);

}

exports.getDictionary = async function(req, res, next) {

  let id = req.params.id
  let dictionaries = await lessonService.getDictionary(id)

  res.json(dictionaries);

}

exports.searchDictionaries = async function(req, res, next) {

  let word = req.params.word
  let dictionaries = await lessonService.searchDictionaries(word)

  res.json(dictionaries);

}

exports.getOrder = async function(req, res, next) {

  // console.log(req.params);
  let contents = await orderService.getOrder(req.params.id)

  // console.log(contents);

  res.json(contents);
}

exports.getGroup = async function(req, res, next) {

  // console.log(req.params);
  let contents = await groupService.getGroup(req.params.id)

  // console.log(contents);

  res.json(contents);
}

exports.getClassrooms = async function(req, res, next) {

  let id = req.params.id
  let classrooms = await lessonService.getClassrooms(id)

  res.json(classrooms);

}

exports.getClasses = async function(req, res, next) {

  let id = req.params.id
  let classes = await lessonService.getClasses(id)

  res.json(classes);

}