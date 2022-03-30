const jwt = require('jsonwebtoken');
const rpouser = require('./repositories/users')
var store = require('store')

exports.getLoginUser = async function(req) {
    // let email = req.cookies.email
    // let user;

    // if (userEmail) {
    //     user = await rpouser.findQuery({email: userEmail})
    // }
    // return user ? user[0] : null;

    // get from local storage if it has vuex and registered token
    let vuex = store.get('vuex')

    console.log(vuex);
}




