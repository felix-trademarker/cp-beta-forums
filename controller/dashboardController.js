let rpoTopics = require('../repositories/topics');
let rpoSubTopics = require('../repositories/subTopics');
let rpoUsers = require('../repositories/mysql/_users');
const { ConnectContactLens } = require('aws-sdk');

let helpers = require('../helpers');
const { json } = require('stream/consumers');

exports.landing = async function(req, res, next) {

  let topics = await rpoTopics.get();
  let selectedTopic = req.params.id

  let userData;


  if (req.cookies.email) {
    userData = await rpoUsers.getUserByEmailSQL(req.cookies.email)
  }

  userData = userData && userData.length > 0 ? userData[0] : null

  for(let i=0; i < topics.length; i++) {
    let listSubTopics = await rpoSubTopics.findQuery({ parentName: topics[i].name })
    topics[i].sub = listSubTopics
    
    if (i == 0 && !selectedTopic) {
      selectedTopic = topics[i].sub[0]._id
    }

  }
    
  res.render('dashboard/', { 
    title: '',
    description: '',
    keywords: '',
    selectedTopic: selectedTopic,
    topics: topics,
    userData: userData
  });

}

exports.forum = async function(req, res, next) {

  let topics = await rpoSubTopics.get();
  let selectedTopic = req.params.id

  let userData;


  if (req.cookies.email) {
    userData = await rpoUsers.getUserByEmailSQL("felix@bigfoot.com")
  }

  res.render('dashboard/forum', { 
    title: '',
    description: '',
    keywords: '',
    topics: topics,
    userData: userData
  });

}

exports.forumPage = async function(req, res, next) {

  let topics = await rpoTopics.get();
  let selectedTopic = req.params.id

  let userData;


  if (req.cookies.email) {
    userData = await rpoUsers.getUserByEmailSQL(req.cookies.email)
  }

  userData = userData && userData.length > 0 ? userData[0] : null

  for(let i=0; i < topics.length; i++) {
    let listSubTopics = await rpoSubTopics.findQuery({ parentName: topics[i].name })
    topics[i].sub = listSubTopics
    
    if (i == 0 && !selectedTopic) {
      selectedTopic = topics[i].sub[0]._id
    }

  }
    
  res.render('dashboard/forum-page', { 
    title: '',
    description: '',
    keywords: '',
    selectedTopic: selectedTopic,
    topics: topics,
    userData: userData
  });

}


exports.downloadPage = async function(req, res, next) {
    
  res.render('pages/download', { 
    title: '',
    description: '',
    keywords: '',
  });

}

exports.weNeedYou = async function(req, res, next) {
    
  res.render('pages/weneedyou', { 
    title: '',
    description: '',
    keywords: '',
  });

}

exports.ourMission = async function(req, res, next) {
    
  res.render('pages/ourmission', { 
    title: '',
    description: '',
    keywords: '',
  });

}

exports.enroll = async function(req, res, next) {
    
  res.render('pages/enroll', { 
    title: '',
    description: '',
    keywords: '',
  });

}

exports.about = async function(req, res, next) {
    
  res.render('pages/about', { 
    title: '',
    description: '',
    keywords: '',
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

  let topicId = req.params.id

  

  if (req.body && req.body.name) {
    // update
    await rpoTopics.update(topicId,req.body);

    message = {
      status: true,
      message: "Updated Successfully!"
    }
  }

  let topics = await rpoTopics.find(topicId);

  if (!topics) res.redirect('/admin-dashboard/topics') 
    
  res.render('admin/topics/edit', { 
    title: '',
    description: '',
    keywords: '',
    topic: topics[0],
    message: message

  });

     
}

exports.deleteTopics = async function(req, res, next) {

  let message;

  let topicId = req.params.id

  let topics = await rpoTopics.remove(topicId);

  res.write("delete")

     
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

exports.editSubTopics = async function(req, res, next) {

  let message;

  let topicId = req.params.id

  

  if (req.body && req.body.name) {
    // update
    await rpoSubTopics.update(topicId,req.body);

    message = {
      status: true,
      message: "Updated Successfully!"
    }
  }

  let topics = await rpoSubTopics.find(topicId);

  console.log(topics);

  if (!topics) res.redirect('/admin-dashboard/sub-topics') 
    
  res.render('admin/sub-topics/edit', { 
    title: '',
    description: '',
    keywords: '',
    topic: topics[0],
    message: message

  });

     
}