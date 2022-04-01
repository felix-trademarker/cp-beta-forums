var rpoSubTopics = require('../../repositories/subTopics');
var rpoComments = require('../../repositories/comments');
var path = require('path')
var helpers = require('../../helpers')
const { toInteger } = require('lodash'); 

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




