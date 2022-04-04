const jwt = require('jsonwebtoken');
var store = require('store')

let rpoUsers = require('./repositories/mysql/_users');
let rpoEnrolledUsers = require('./repositories/betaUsers');

exports.getLoginUser = async function(req) {
    let userData;

    if (req.cookies.email) {
        userData = await rpoUsers.getUserByEmailSQL(req.cookies.email)
    }
    
    userData = userData && userData.length > 0 ? userData[0] : null
    
    return userData
}

exports.isBetaTester = async function(req) {
    let userData;
    let flag = false

    if (req.cookies.email) {
        userData = await rpoUsers.getUserByEmailSQL(req.cookies.email)
    }
    
    userData = userData && userData.length > 0 ? userData[0] : null

    if (userData) {
        let isBeta = await rpoEnrolledUsers.findQuery({email: userData.email})
        if (isBeta && isBeta.length > 0) {
            flag = true
        }
    }
    
    return flag
}




