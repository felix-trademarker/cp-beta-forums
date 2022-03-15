const jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt');
let helpers = require('../helpers')
let rpoUsers = require('../repositories/users');

exports.showLogin = function(req, res, next) {

    var hash = bcrypt.hashSync("password", 10); 
    // let data = {
    //     name: "test",
    //     username: "test@test.cc",
    //     email: "test@test.cc",
    //     password: hash
    // }

    let currentUser = helpers.getLoginUser(req)
    // console.log(currentUser);
    // rpoUsers.put(data);
    if(currentUser)  res.redirect('/dashboard')
    // console.log(req.app.locals.message)
    res.render('login', { 
        title: 'Login Form',
        localsVar: req.app.locals
    });
}

exports.login = async function(req,res){

    // return 'asd';
    var username=req.body.username;
    var password=req.body.password;

    // CHECK MONGODB IF EXIST AND VALIDATE
    let users = await rpoUsers.findEmail(username);
    // console.log(username,users)
    // check in mongo db
    if ( users && users[0]) {

        // console.log('Validating Via mongo DB...');

        let response = validateHashUser(password, users[0], res);

    } else {
        res.redirect('/')
    }

}

exports.logout = async function(req, res, next) {
    
    res.clearCookie("jwt");
    res.redirect('/'); 

}

function validateHashUser(pass, obj, res){

    var hash = obj.password;

    // console.log(obj);

    if (!hash) {

        // req.app.locals.message = {
        //     status: false,
        //     type: "error",
        //     message: "Email and password does not match!"
        // }
        res.flash('error', 'Email and password does not match!');
        res.redirect('/')
        // res.json({
        //     status:false,                  
        //     message:"Email and password does not match!"
        // });
    }

    hash = hash.replace(/^\$2y(.+)$/i, '$2a$1');

    bcrypt.compare(pass, hash, async function(err, ress) {

        if(!ress){
            
            res.flash('error', 'Email and password does not match!');
            // req.app.locals.message = {
            //     status: false,
            //     type: "error",
            //     message: "Email and password does not match!"
            // }
            res.redirect('/')
            // res.json({
            // status:false,                  
            // message:"Email and password does not match!"
            // });

        } else {     

            //use the payload to store information about the user such as username, user role, etc.
            let payload = {user: JSON.stringify(obj)}

            //create the access token with the shorter lifespan
            let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES
            });

            

            //send the access token to the client inside a cookie
            // res.setHeader('Cache-Control', 'private');
            res.cookie("jwt", accessToken);
            res.redirect('/dashboard')
            // res.json({
            //     status:true,
            //     message:"Success",
            //     user: obj
            // });

        }
    });   

}
