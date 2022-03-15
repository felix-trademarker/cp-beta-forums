const jwt = require('jsonwebtoken');

exports.getLoginUser = function(req) {
    let decode = jwt.decode(req.cookies.jwt, {complete: true});
    let accessToken = req.cookies.jwt
    let user;
    

    let payload
    try{

        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        
        if (decode && decode.payload.user) {
            user = JSON.parse(decode.payload.user);
    
            if ( user && user._id ) {
                user._id = ObjectID(user._id)
            }
    
        }
    }
    catch(e){
        console.log(e.message);
    }
 

    return user
}




