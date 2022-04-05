var express = require('express');


const dashboardController = require('../controller/dashboardController')


var router = express.Router();

// TESTERS ============================
// ====================================

router.get('/',dashboardController.landing);
router.get('/forums',dashboardController.forum);
router.get('/forums/:id',dashboardController.forumPage);

router.get('/download',dashboardController.downloadPage);
router.get('/we-need-you',dashboardController.weNeedYou);
router.get('/our-mission',dashboardController.ourMission);
router.get('/become-a-beta-tester',dashboardController.enroll);
router.get('/about',dashboardController.about);
// router.get('/dashboard-topics/:topics',dashboardController.topics);

router.post('/forums',dashboardController.addSubTopicsClient);
router.post('/forums/participate',dashboardController.participate);


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
