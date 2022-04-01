const jwt = require('jsonwebtoken');
var store = require('store')

let rpoUsers = require('./repositories/mysql/_users');

exports.getLoginUser = async function(req) {
    let userData;

    if (req.cookies.email) {
        userData = await rpoUsers.getUserByEmailSQL(req.cookies.email)
    }
    
    userData = userData && userData.length > 0 ? userData[0] : null
    
    return userData
}




