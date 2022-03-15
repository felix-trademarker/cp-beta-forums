var express = require('express');
var genericController = require('../controller/api/genericController')

var router = express.Router();


// TOPICS
router.get('/topics/:topicId', genericController.fetchSubTopic);
router.get('/comments/:topicId', genericController.fetchComments);
router.post('/add-comment/', genericController.addComments);


// USERS


module.exports = router;
