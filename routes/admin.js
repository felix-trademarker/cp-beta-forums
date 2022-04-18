var express = require('express');


const controller = require('../controller/adminController')


var router = express.Router();

// ADMIN ==============================
// ====================================
router.get('/',controller.adminDashboard);


// ************** CATEGORIES **************
router.get('/categories',controller.addCategory);
router.post('/categories',controller.addCategory);
router.get('/categories/edit/:id',controller.editCategory);
router.post('/categories/edit/:id',controller.editCategory);
router.get('/categories/delete/:id',controller.deleteCategory);

// ************** TOPICS **************
router.get('/topics',controller.addTopics);
router.post('/topics',controller.addTopics);
router.get('/topics/edit/:id',controller.editTopics);
router.post('/topics/edit/:id',controller.editTopics);
router.get('/topics/delete/:id',controller.deleteTopics);

// ************** BETA TESTERS **************
router.get('/testers',controller.testers);
router.get('/testers/edit/:id',controller.editTesters);
router.post('/testers/edit/:id',controller.editTesters);
// router.get('/testers/edit/:id',controller.editTopics);
// router.post('/testers/edit/:id',controller.editTopics);
// router.get('/testers/delete/:id',controller.deleteTopics);

// ************** COMMENTS **************
router.get('/comments',controller.comments);
router.get('/comments/delete/:id',controller.deleteComments);





module.exports = router;
