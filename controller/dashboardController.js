let rpoTopics = require('../repositories/topics');
let rpoSubTopics = require('../repositories/subTopics');
let rpoComments = require('../repositories/comments');
let rpoUsers = require('../repositories/users');

let mailService = require('../services/mailService')

var path = require('path')
const { toInteger } = require('lodash'); 

let helpers = require('../helpers');

exports.landing = async function(req, res, next) {

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
  let isBetaTester = await helpers.isBetaTester(req)
  let latestComments = await rpoComments.getLatestComments()
  // console.log(userData);
  // console.log(latestComments);

  res.render('dashboard/forum', { 
    title: '',
    description: '',
    keywords: '',
    topics: topics,
    subTopics: subTopics,
    userData: userData,
    latestComments: latestComments,
    isBetaTester: isBetaTester
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
    
    if (req.files && req.files.topicImage) {
      var file = req.files.topicImage
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
  let isBetaTester = userData && userData.isBetaTester ? true : false;

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
    userData: userData,
    isBetaTester: isBetaTester
  });

}


exports.downloadPage = async function(req, res, next) {
    
  let userData = await helpers.getLoginUser(req)
  let isBeta = await helpers.isBetaTester(req)
  // console.log(req.cookies.email);
  // console.log(userData);

  res.render('pages/download', { 
    title: '',
    description: '',
    keywords: '',
    userData: userData,
  });

}

exports.participate = async function(req, res, next) {
    
  let userData = await helpers.getLoginUser(req)
  console.log("participate", userData, req.body);
  let userAgree = req.body.agreement

  if (userAgree) {
    // put 

    userData.dateJoined = req.app.locals.moment().format()
    // rpoBetaUsers.put(userData)
    let testerData = {
      testerJoinDate : req.app.locals.moment().format(),
      testerDevice : req.body.testerDevice,
      isBetaTester : true,
    }

    rpoUsers.update(userData._id, testerData)

    // send welcome email
    let mailData = {
      subject: "Welcome to our Beta APP Program",
      to: userData.email,
      message: `
        <p>Hi ${userData.username},</p>
        <br>
        <p>Thank you very much for enrolling in the ChinesePod Beta Program.</p>
        <p>Your participation is invaluable for us to help build the best app for YOU in your journey to learn Mandarin Chinese. </p>
        <p>You can start by downloading the beta version of the Chinese Express App for Android Phones through this link:
        https://www.chinesepod.com/beta/download</p>
        <p>Already have the ChinesePod Express App (Beta) installed? Make sure it’s updated with the latest version - Ver. 26</p>
        <p>Share your experiences and suggestions, or report any bugs and issues in our dedicated Forum Page.
        https://www.chinesepod.com/beta/forums</p>

        <p>See you in our Beta Testers Community Page!</p>

        <br><br>
        <p>Sincerely,<br>ChinesePod Team</p>
      `
    }
    mailService.welcomeBetaTester(mailData)

    res.flash('success', 'Thank you for participating with our Beta App.');
    res.redirect("/beta/download")
  } else {
    // redirect
    res.flash('error', 'You need to agree with the terms and conditions');
    res.redirect("/beta/download")
  }

  

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