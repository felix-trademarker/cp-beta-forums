
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
    returnedData.records = await rpoGroups.getGroupRecords(id)
    returnedData.tags = await rpoGroups.getGroupTags(id)
    returnedData.studentTeacher = await rpoGroups.getGroupStudentTeacher(id)

    // FIND GROUP CATEGORIES
    let groupCategories = await rpoGroups.getGroupCategories()
    if (groupCategories && groupCategories.length > 0) {
        for(let g=0; g < groupCategories.length; g++) {
            let groupsCate = groupCategories[g].groupCateGroups.split(",")
            let found = groupsCate.find(element => element == id);

            if (found) {
                returnedData.category = groupCategories[g]
                returnedData.category.groupCateGroups = groupsCate
            }
        }
    }

    return returnedData
}
