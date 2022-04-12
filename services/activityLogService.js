let rpoActivity = require('../repositories/activityLog');
let _variables = require('../config/variables');

let geoip = require('geoip-lite');
let helpers = require('../helpers')

const { toInteger, isNumber } = require('lodash');
let moment = require('moment');

exports.logger = async function(req, msg) {
    // console.log('this', ip);
    
    let ip = req.ip, page = req.originalUrl;

    let user = await helpers.getLoginUser(req);
    let name = user && user.username ? user.username : 'guest';

    var ipArr = ip.split(".")
    var subnetIp = ip.replace("."+ipArr[ipArr.length -1], '')

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    let geo = geoip.lookup(ip);

    if ( !_variables.ipAddresses.includes(subnetIp) )
    if ( geo ) {

        let _data = {
            ip      : ip,
            user    : name,
            uri     : page,
            country : geo.country,
            city    : geo.city,
            region  : geo.region,
            activity: msg,
            fromEmail: fromEmail,
            created_at: toInteger(moment().format('YYMMDD')),
            created_at_formatted: moment().format()
        };

        rpoActivity.put(_data);
    } else {
        let _data = {
            ip      : ip,
            user    : name,
            uri     : page,
            country : '',
            city    : '',
            region  : '',
            activity: msg,
            fromEmail: fromEmail,
            created_at: toInteger(moment().format('YYMMDD')),
            created_at_formatted: moment().format()
        };

        rpoActivity.put(_data);
    }
 
}
