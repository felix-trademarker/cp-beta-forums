var express = require('express');
var genericController = require('../controller/api/genericController')

var router = express.Router();


// TOPICS
router.get('/topics/:topicId', genericController.fetchSubTopic);
router.get('/comments/:topicId', genericController.fetchComments);
router.get('/find-comment/:commentId', genericController.findComments);
router.post('/add-comment/', genericController.addComments);
router.post('/add-comment/upload-image', genericController.addImageComments);

router.get('/topics', genericController.getTopics);
router.post('/update-comment/', genericController.updateComments);
router.post('/delete-comment/', genericController.deleteComments);




// USERS
router.get('/check-auth/:email', genericController.getAuth);
router.post('/check-auth/', genericController.getAuth);

// LESSON API GET INFO ON HANZI
router.get('/lookup-hanzi/:hanzi', genericController.lookupHanzi);

// CONVERSION API
router.get('/lesson/:v3Id', genericController.getLesson);


router.get('/user-progress/', genericController.getUserProgress);
router.get('/user-progress/:h-:d', genericController.getUserProgress);

router.get('/user/:id', genericController.getUser);
router.get('/list/users', genericController.getUserslist);
router.get('/list/users/:page/:limit', genericController.getUserslist);


router.get('/list/lessons', genericController.getLessonslist);
router.get('/list/lessons/:page/:limit', genericController.getLessonslist);

router.get('/order/:id', genericController.getOrder);

router.get('/group/:id', genericController.getGroup);


module.exports = router;