const jwt = require('jsonwebtoken');
var store = require('store')

let rpoUsers = require('./repositories/mysql/_users');

exports.getLoginUser = async function(req) {
    let userData;

    if (!store.get('userData')) {
        req.cookies.email = "felix@bigfoot.com"
        if (req.cookies.email) {
            userData = await rpoUsers.getUserByEmailSQL("felix@bigfoot.com")
        }
        
        userData = userData && userData.length > 0 ? userData[0] : null
        store.set('userData', userData )

    } else {
        userData = store.get('userData')
    }
    return userData
}




