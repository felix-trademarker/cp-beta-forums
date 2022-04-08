var rpoTopics = require('../../repositories/topics');
var rpoSubTopics = require('../../repositories/subTopics');
var rpoComments = require('../../repositories/comments');
// var rpoComments = require('../../repositories/comments');
var path = require('path')
var helpers = require('../../helpers')
const { toInteger } = require('lodash'); 

let rpoUsersMySQL = require('../../repositories/mysql/_users');
let rpoUsers = require('../../repositories/users');

let mailService = require('../../services/mailService')

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
    topicId: req.params.topicId
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

    let mailDataAdmin = {
      subject: "ChinesePod Beta Program | " + data.testerName + " replied to your feedback",
      to: data.replyToData.userData.email,
      message: `
        <h3 style="margin-bottom:30px;">Hi ${data.replyToData.userData.username},</h3>

        <p>${data.testerName} replied to your feedback</p>
        <p>${data.message.replace("\n","<br>")}</p>

        <p><a href="https://www.chinesepod.com/beta/forums/${data.topicId}">Reply</p>

        <br>
        <p>Sincerely,<br>ChinesePod Team</p>
      `
    }
    mailService.defaultSend(mailDataAdmin)

  }

  let userData = await helpers.getLoginUser(req)

  data.userData = userData

  data.created_at = req.app.locals.moment().format()

  await rpoComments.put(data)

  // Update topic counters
  let topics = await rpoSubTopics.find(data.topicId)
  topics = topics.length > 0 ? topics[0]:null

  if (topics) {

    console.log("update topics");
    // topics.lastCommentDate = data.created_at

    let comments = await rpoComments.findQuery({topicId:topics._id+"" })
    console.log(comments.length, topics._id)
    // topics.numberOfComments = comments.length

    let topicsData = {
      lastCommentDate: data.created_at,
      numberOfComments: comments.length
    }

    rpoSubTopics.update(topics._id, topicsData)

    // send email notification topics has feedback
    let mailDataAdmin = {
      subject: "ChinesePod Beta Program | "+data.testerName+" Added new feedback on your topic",
      to: data.replyToData.userData.email,
      message: `
        <h3 style="margin-bottom:30px;">Hi ${data.replyToData.userData.username},</h3>

        <p>${data.testerName} leave a feedback on your topic</p>
        <p>${data.message.replace("\n","<br>")}</p>

        <p><a href="https://www.chinesepod.com/beta/forums/${data.topicId}">Reply</p>

        <br>
        <p>Sincerely,<br>ChinesePod Team</p>
      `
    }
    mailService.defaultSend(mailDataAdmin)
  }

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
    console.log("==================== ERROR FILE UPLOAD =======================");
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
    let listSubTopics = await rpoSubTopics.findQuery({ parentName: topics[i].name, status: {$ne : 'draft'} })
    topics[i].sub = listSubTopics
    
    if (i == 0 && !selectedTopic) {
      selectedTopic = topics[i].sub[0]._id
    }

  }

  // console.log("this", topics);

  res.json(topics);
}



