var express = require('express');


const dashboardController = require('../controller/dashboardController')


var router = express.Router();

// TESTERS ============================
// ====================================

router.get('/',dashboardController.forumId);
router.get('/beta',dashboardController.forumId);
router.get('/forums',dashboardController.forumId);
router.get('/forums/:id',dashboardController.forumId);
// router.get('/dashboard-topics/:topics',dashboardController.topics);

// ADMIN ==============================
// ====================================

// ************** TOPICS **************
router.get('/admin-dashboard/topics',dashboardController.addTopics);
router.post('/admin-dashboard/topics',dashboardController.addTopics);
router.get('/admin-dashboard/topics/edit/:id',dashboardController.editTopics);
router.post('/admin-dashboard/topics/edit/:id',dashboardController.editTopics);
router.get('/admin-dashboard/topics/delete/:id',dashboardController.deleteTopics);

// ************** SUB TOPICS **************
router.get('/admin-dashboard/sub-topics',dashboardController.addSubTopics);
router.post('/admin-dashboard/sub-topics',dashboardController.addSubTopics);
router.get('/admin-dashboard/sub-topics/edit/:id',dashboardController.editSubTopics);
router.post('/admin-dashboard/sub-topics/edit/:id',dashboardController.editSubTopics);






module.exports = router;
