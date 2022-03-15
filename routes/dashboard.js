var express = require('express');


const dashboardController = require('../controller/dashboardController')


var router = express.Router();

// TESTERS ============================
// ====================================

router.get('/',dashboardController.home);
// router.get('/dashboard-topics/:topics',dashboardController.topics);

// ADMIN ==============================
// ====================================

// ************** TOPICS **************
router.get('/admin-dashboard/topics',dashboardController.addTopics);
router.post('/admin-dashboard/topics',dashboardController.addTopics);

// ************** SUB TOPICS **************
router.get('/admin-dashboard/sub-topics',dashboardController.addSubTopics);
router.post('/admin-dashboard/sub-topics',dashboardController.addSubTopics);






module.exports = router;
