let rpoTopics = require('../repositories/topics');
let rpoSubTopics = require('../repositories/subTopics');
let rpoComments = require('../repositories/comments');
let rpoUsers = require('../repositories/mysql/_users');
var path = require('path')
const { toInteger } = require('lodash'); 

let helpers = require('../helpers');

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

  let topics = await rpoTopics.get();
  let subTopics = await rpoSubTopics.getLatestTopics();
  let userData = await helpers.getLoginUser(req)

  let latestComments = await rpoComments.getLatestComments()

  console.log(latestComments);

  res.render('dashboard/forum', { 
    title: '',
    description: '',
    keywords: '',
    topics: topics,
    subTopics: subTopics,
    userData: userData,
    latestComments: latestComments
  });

}


exports.addSubTopicsClient = async function(req, res, next) {

  let userData = await helpers.getLoginUser(req)


  if (req.body && req.body.name) {
    let data = req.body

    let findDuplicate = await rpoTopics.findQuery({name:req.body.name})

    if (findDuplicate && findDuplicate.length > 0) {
      data.topic_id = findDuplicate[0]._id
    }

    data.userData = userData

    // check if it has image attached
    var file = req.files.topicImage
    if (file) {
      var extName = path.extname(file.name)
      var filename = toInteger(req.app.locals.moment().format('YYMMDDHHMMSS')) + '.' + extName;
      filename = filename.toLowerCase()
      uploadPath = __dirname + '/../public/beta/uploads/comments/'+filename;
      file.mv(uploadPath, function(err) {
        console.log(err);
      });
    }
    // add date created
    data.created_at = req.app.locals.moment().format()
    console.log("add flash message");
    res.flash('success', 'Added successfully!, Topic has been sent to admin for approval');
    await rpoSubTopics.put(data)

  }

  res.redirect('/beta/forums')
     
}

exports.forumPage = async function(req, res, next) {

  let topics = await rpoTopics.get();
  let selectedTopic = req.params.id

  let userData = await helpers.getLoginUser(req)

  for(let i=0; i < topics.length; i++) {
    let listSubTopics = await rpoSubTopics.findQuery({ parentName: topics[i].name })
    topics[i].sub = listSubTopics
    
    if (i == 0 && !selectedTopic) {
      selectedTopic = topics[i].sub[0]._id
    }

  }

  console.log("selected", selectedTopic);
    
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