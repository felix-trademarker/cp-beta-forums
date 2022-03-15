var rpoSubTopics = require('../../repositories/subTopics');
var rpoComments = require('../../repositories/comments');

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

  let data = req.body

  data.created_at = req.app.locals.moment().format()

  await rpoComments.put(data)
  // let data = {
  //   results: {
  //     status: true;
  //   }
  // }

  res.json({results:true})
}




