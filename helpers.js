const jwt = require('jsonwebtoken');
var store = require('store')

let rpoUsersMySQL = require('./repositories/mysql/_users');
let rpoUsers = require('./repositories/users');


exports.getLoginUser = async function(req) {
    let userData;

    if (req.cookies.CPODSESSID) {
        console.log("===================== FOUND CPODSESSID");
        userData = await rpoUsersMySQL.getUserBySession(req.cookies.CPODSESSID)

        if (userData.length <= 0) {
            console.log("fetch from mysql");
            userData = await rpoUsersMySQL.getUserByEmailSQL(req.cookies.email)
            
            // ADD IN MONGO
            if (userData && userData.length > 0) {
                rpoUsers.put(userData[0])
            }
        }
    }

    if (req.cookies.email) {
        console.log("===================== FOUND email");
        console.log("helpers email");
        // find user in mongo if not fetch in mysql and store in mongo
        userData = await rpoUsers.findEmail(req.cookies.email)
        // console.log(userData);
        if (userData.length <= 0) {
            console.log("fetch from mysql");
            userData = await rpoUsersMySQL.getUserByEmailSQL(req.cookies.email)
            
            // ADD IN MONGO
            if (userData && userData.length > 0) {
                rpoUsers.put(userData[0])
            }
        }
    }
    
    userData = userData && userData.length > 0 ? userData[0] : null
    
    return userData
}

exports.isBetaTester = async function(req) {
    let userData;
    let flag = false

    if (req.cookies.email) {
        userData = await rpoUsers.findEmail(req.cookies.email)
    }

    if (userData && userData.length > 0 && userData[0].isBetaTester) {
        flag = true
    }
    
    return flag
}




