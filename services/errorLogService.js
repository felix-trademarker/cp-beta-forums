let rpoErrorLog = require('../repositories/errorLog');

let geoip = require('geoip-lite');
let helpers = require('../helpers');

const { toInteger, isNumber } = require('lodash');
let moment = require('moment');

exports.logger = async function(code,msg, req) {
    // console.log('this', ip);
    let ip = req.ip;
    let page = req.url
    // console.log("logging error =====================");
    let user = await helpers.getLoginUser(req);
    let name = user && user.name ? user.name : 'guest';
    

    var ipArr = ip.split(".")
    var subnetIp = ip.replace("."+ipArr[ipArr.length -1], '')

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    let geo = geoip.lookup(ip);
    let _data;

    // if ( !_variables.ipAddresses.includes(subnetIp) )
    if ( geo ) {

        _data = {
            ip      : ip,
            user    : name,
            uri     : page,
            country : geo.country,
            city    : geo.city,
            region  : geo.region,
            message: msg,
            code: code,
            created_at: toInteger(moment().format('YYMMDD')),
            created_at_formatted: moment().format()
        };

    } else {
        _data = {
            ip      : ip,
            user    : name,
            uri     : page,
            country : '',
            city    : '',
            region  : '',
            message: msg,
            code: code,
            created_at: toInteger(moment().format('YYMMDD')),
            created_at_formatted: moment().format()
        };

    }
    if (_data.uri != "/javascripts/bootstrap.bundle.min.js.map") {
        rpoErrorLog.put(_data);
    }

    if (_data.code == 500) {
        // mailService.sendErrorLogs(_data)
    }

    
 
}

