let rpoTopics = require('../repositories/topics');
let rpoSubTopics = require('../repositories/subTopics');
const { ConnectContactLens } = require('aws-sdk');

exports.home = async function(req, res, next) {

  let topics = await rpoTopics.get();
  // let subtopics = await rpoSubTopics.get();

  // let combinedTopics;

  for(let i=0; i < topics.length; i++) {
    let listSubTopics = await rpoSubTopics.findQuery({ parentName: topics[i].name })
    topics[i].sub = listSubTopics
    console.log(listSubTopics);
  }

  // console.log(topics);
    
  res.render('dashboard/', { 
    title: '',
    description: '',
    keywords: '',
    topics: topics
  });

     
}


// ============================ ADMIN FUNCTIONS
exports.addTopics = async function(req, res, next) {

  let message;

  if (req.body && req.body.name) {
    
    let findDuplicate = await rpoTopics.findQuery({name:req.body.name})

    if (findDuplicate && findDuplicate.length > 0) {
      message = {
        status: false,
        message: "Topic Already Exist!"
      }
    } else {
      await rpoTopics.put(req.body)
      message = {
        status: true,
        message: "Added Successfully!"
      }
    }

  }

  let topics = await rpoTopics.get();
    
  res.render('admin/topics/', { 
    title: '',
    description: '',
    keywords: '',
    topics: topics,
    message: message

  });

     
}

exports.editTopics = async function(req, res, next) {

  let message;

  if (req.body && req.body.name) {
    
    let findDuplicate = await rpoTopics.findQuery({name:req.body.name})

    if (findDuplicate && findDuplicate.length > 0) {
      message = {
        status: false,
        message: "Topic Already Exist!"
      }
    } else {
      await rpoTopics.put(req.body)
      message = {
        status: true,
        message: "Added Successfully!"
      }
    }

  }

  let topics = await rpoTopics.get();
    
  res.render('admin/topics/', { 
    title: '',
    description: '',
    keywords: '',
    topics: topics,
    message: message

  });

     
}

exports.addSubTopics = async function(req, res, next) {

  let message;

  // console.log(req.app.locals.moment().format());

  if (req.body && req.body.name) {
    let data = req.body

    let findDuplicate = await rpoTopics.findQuery({name:req.body.name})

    if (findDuplicate && findDuplicate.length > 0) {
      data.topic_id = findDuplicate[0]._id
    }

    // add date created
    data.created_at = req.app.locals.moment().format()

    await rpoSubTopics.put(data)
    message = {
      status: true,
      message: "Added Successfully!"
    }

  }

  let topics = await rpoTopics.get();
  let subtopics = await rpoSubTopics.get();
    
  res.render('admin/sub-topics/', { 
    title: '',
    description: '',
    keywords: '',
    topics: topics,
    subtopics: subtopics,
    message: message

  });

     
}