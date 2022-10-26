
let rpoGroups158 = require('../repositories/_groups158')
let rpoGroups = require('../repositories/mysql/_groups')

let moment = require('moment');
const {unserialize} = require('php-serialize');

exports.getGroup = async function(id) {
    
    let returnedData = await rpoGroups.getGroup(id)

    if (returnedData && returnedData.length > 0) {
        returnedData = returnedData[0]
    } else {
        return []
    }

    returnedData.invites = await rpoGroups.getGroupInvites(id)
    returnedData.contents = await rpoGroups.getGroupContents(id)

    return returnedData
}
