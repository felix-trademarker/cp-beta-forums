let rpoTopics = require('../repositories/topics');
let rpoSubTopics = require('../repositories/subTopics');
let rpoComments = require('../repositories/comments');
let rpoUsers = require('../repositories/users');

let mailService = require('../services/mailService')

var path = require('path')
const { toInteger } = require('lodash'); 

let helpers = require('../helpers');

exports.adminDashboard = async function(req, res, next) {
    
  res.render('admin/', { 
    title: 'ChinesePod Beta Program | Admin Dashboard',
    description: '',
    keywords: ''

  });

     
}

// ============================ ADMIN FUNCTIONS
exports.addCategory = async function(req, res, next) {

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
    
  res.render('admin/categories/', { 
    title: '',
    description: '',
    keywords: '',
    topics: topics,
    message: message

  });

     
}

exports.editCategory = async function(req, res, next) {

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

  if (!topics) res.redirect('/admin-dashboard/categories') 
    
  res.render('admin/categories/edit', { 
    title: '',
    description: '',
    keywords: '',
    topic: topics[0],
    message: message

  });

     
}

exports.deleteCategory = async function(req, res, next) {

  let message;

  let topicId = req.params.id

  let topics = await rpoTopics.remove(topicId);

  res.write("delete")

     
}

// ============================ TOPICS FUNCTIONS
exports.addTopics = async function(req, res, next) {

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
    
  res.render('admin/topics/', { 
    title: '',
    description: '',
    keywords: '',
    topics: topics,
    subtopics: subtopics,
    message: message

  });

     
}

exports.editTopics = async function(req, res, next) {

  let message;
  let topicId = req.params.id
  let topics = await rpoSubTopics.find(topicId);


  if (req.body && req.body.name) {
    // update
    await rpoSubTopics.update(topicId,req.body);

    // check if other statur to publish
    if (topics && topics.length > 0) {
      if (req.body.status == "publish" && topics[0].status != req.body.status ) {
        // notify author published
        let mailDataAdmin = {
          subject: "Topic ["+topics[0].name+"] has been Approved and Publish",
          to: topics[0].userData.email,
          message: `
            <h3 style="margin-bottom:30px;">Hi ${topics[0].userData.username},</h3>
    
            <p>Congratulations! submitted topic has been Approved and Published.</p>
            <p>Topic <a href="https://www.chinesepod.com/beta/forums/${topics[0]._id}">${topics[0]}</a></p>
    
            <br>
            <p>Sincerely,<br>ChinesePod Team</p>
          `
        }
    
        mailService.basicSend(mailDataAdmin)

      }

    }

    message = {
      status: true,
      message: "Updated Successfully!"
    }
  }


  console.log(topics);

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

  let topics = await rpoSubTopics.remove(topicId);

  res.redirect("/beta/admin-dashboard/topics/")

     
}


// ============================ TESTERS FUNCTIONS
exports.testers = async function(req, res, next) {

  let users = await rpoUsers.findQuery({isBetaTester:true});
  let subtopics = await rpoSubTopics.get();
    
  res.render('admin/users/', {
    title: '',
    description: '',
    keywords: '',
    users: users,

  });

     
}


exports.editTesters = async function(req, res, next) {

  let message;
  let userId = req.params.id
  let testers = await rpoUsers.find(userId);


  if (req.body && req.body.username) {
    // update
    await rpoUsers.update(userId,req.body);

    res.redirect("/beta/admin-dashboard/testers")
  }




  if (!testers) res.redirect('/admin-dashboard/testers') 
    
  res.render('admin/users/edit', { 
    title: '',
    description: '',
    keywords: '',
    testers: testers[0]

  });

     
}


// exports.editTopics = async function(req, res, next) {

//   let message;
//   let topicId = req.params.id
//   let topics = await rpoSubTopics.find(topicId);


//   if (req.body && req.body.name) {
//     // update
//     await rpoSubTopics.update(topicId,req.body);

//     // check if other statur to publish
//     if (topics && topics.length > 0) {
//       if (req.body.status == "publish" && topics[0].status != req.body.status ) {
//         // notify author published
//         let mailDataAdmin = {
//           subject: "Topic ["+topics[0].name+"] has been Approved and Publish",
//           to: topics[0].userData.email,
//           message: `
//             <h3 style="margin-bottom:30px;">Hi ${topics[0].userData.username},</h3>
    
//             <p>Congratulations! submitted topic has been Approved and Published.</p>
//             <p>Topic <a href="https://www.chinesepod.com/beta/forums/${topics[0]._id}">${topics[0]}</a></p>
    
//             <br>
//             <p>Sincerely,<br>ChinesePod Team</p>
//           `
//         }
    
//         mailService.basicSend(mailDataAdmin)

//       }

//     }

//     message = {
//       status: true,
//       message: "Updated Successfully!"
//     }
//   }


//   console.log(topics);

//   if (!topics) res.redirect('/admin-dashboard/topics') 
    
//   res.render('admin/topics/edit', { 
//     title: '',
//     description: '',
//     keywords: '',
//     topic: topics[0],
//     message: message

//   });

     
// }

// exports.deleteTopics = async function(req, res, next) {

//   let message;

//   let topicId = req.params.id

//   let topics = await rpoSubTopics.remove(topicId);

//   res.redirect("/beta/admin-dashboard/topics/")

     
// }