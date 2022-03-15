var express = require('express');
var router = express.Router();

const { login, showLogin, logout } = require('../controller/authController')

// show login form
router.get('/', showLogin)
router.post('/login', login)
// router.get('/auth', login)
// router.post('/auth2', login_ajax)
// router.get('/refresh', refresh)

// router.get('/:hash/:email', loginApi)
router.get('/logout', logout)

// router.get('/change-pass', changePassword)

module.exports = router;
