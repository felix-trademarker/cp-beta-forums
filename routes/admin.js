var express = require('express');


const controller = require('../controller/adminController')


var router = express.Router();

// ADMIN ==============================
// ====================================

// ************** TOPICS **************
router.get('/categories',controller.addCategory);
router.post('/categories',controller.addCategory);
router.get('/categories/edit/:id',controller.editCategory);
router.post('/categories/edit/:id',controller.editCategory);
router.get('/categories/delete/:id',controller.deleteCategory);

// ************** SUB TOPICS **************
router.get('/topics',controller.addTopics);
router.post('/topics',controller.addTopics);
router.get('/topics/edit/:id',controller.editTopics);
router.post('/topics/edit/:id',controller.editTopics);






module.exports = router;
