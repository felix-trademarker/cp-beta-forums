var rpoSubTopics = require('../../repositories/subTopics');
var rpoComments = require('../../repositories/comments');
var path = require('path')
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
  data.file = data.file.split(',')

  if (data.replyTo) {
    let results = await rpoComments.find(data.replyTo)
    data.replyToData = results[0]
  }

  data.created_at = req.app.locals.moment().format()

  await rpoComments.put(data)

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




