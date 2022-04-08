var express = require('express');


const dashboardController = require('../controller/dashboardController')


var router = express.Router();

// TESTERS ============================
// ====================================

router.get(['/', '/beta'],dashboardController.landing);
router.get(['/forums', '/beta/forums'],dashboardController.forum);
router.get(['/forums/:id','/beta/forums/:id'],dashboardController.forumPage);

router.get(['/download','/beta/download'],dashboardController.downloadPage);
router.get(['/we-need-you','/beta/we-need-you'],dashboardController.weNeedYou);
router.get(['/our-mission','/beta/our-mission'],dashboardController.ourMission);
router.get(['/become-a-beta-tester','/beta/become-a-beta-tester'],dashboardController.enroll);
router.get(['/about','/beta/about'],dashboardController.about);
// router.get('/dashboard-topics/:topics',dashboardController.topics);

router.post(['/forums', '/beta/forums'],dashboardController.addSubTopicsClient);
router.post(['/forums/participate', '/beta/forums/participate'],dashboardController.participate);

module.exports = router;
