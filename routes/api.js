var express = require('express');
var genericController = require('../controller/api/genericController')

var router = express.Router();


// TOPICS
router.get('/topics/:topicId', genericController.fetchSubTopic);
router.get('/comments/:topicId', genericController.fetchComments);
router.get('/find-comment/:commentId', genericController.findComments);
router.post('/add-comment/', genericController.addComments);
router.post('/add-comment/upload-image', genericController.addImageComments);


// USERS


module.exports = router;
