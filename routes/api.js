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

router.get('/lesson/:v3Id', genericController.getLesson);

// router.get('/user-progress/:userId', genericController.getUserProgress);

module.exports = router;
