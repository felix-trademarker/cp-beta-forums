var rpoSubTopics = require('../../repositories/subTopics');
var rpoComments = require('../../repositories/comments');
var path = require('path')
const { toInteger } = require('lodash'); 

exports.fetchSubTopic = async function(req, res, next) {
  let results = await rpoSubTopics.find(req.params.topicId)
  res.json({results:results[0]});
}

exports.fetchComments = async function(req, res, next) {
  let query = {
    topicId: req.params.topicId
  }
  let results = await rpoComments.findQuery(query)
  res.json({results:results});
}

exports.addComments = async function(req, res, next) {
  

  console.log("form submit",req.body);
  // console.log("form submit",req.files);

  let data = req.body
  // let files = decode(data.file)
  // console.log(...data.file);
  data.file = data.file.split(',')
  // if (data.files) {
  //   for ( let i=0; i < data.files.length; i++ ) {
  //     let file = data.files[i]
  //     console.log(file);
  //   };
  // }

  data.created_at = req.app.locals.moment().format()

  await rpoComments.put(data)
  // let data = {
  //   results: {
  //     status: true;
  //   }
  // }

  res.json({results:true})
}

exports.addImageComments = async function(req, res, next) {
  
  var file = req.files.file
  var extName = path.extname(file.name)
  var filename = toInteger(req.app.locals.moment().format('YYMMDDHHMMSS')) + '.' + extName;
  filename = filename.toLowerCase()
  uploadPath = __dirname + '/../../public/uploads/comments/'+filename;
  file.mv(uploadPath, function(err) {});

  res.json({results:filename})
}




