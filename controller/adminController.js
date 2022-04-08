let rpoTopics = require('../repositories/topics');
let rpoSubTopics = require('../repositories/subTopics');
let rpoComments = require('../repositories/comments');
let rpoUsers = require('../repositories/users');

let mailService = require('../services/mailService')

var path = require('path')
const { toInteger } = require('lodash'); 

let helpers = require('../helpers');

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

  if (!topics) res.redirect('/admin-dashboard/topics') 
    
  res.render('admin/topics/edit', { 
    title: '',
    description: '',
    keywords: '',
    topic: topics[0],
    message: message

  });

     
}