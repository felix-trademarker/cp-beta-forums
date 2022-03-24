let rpoContents = require('../repositories/mysql/_contents');
let rpoUsers = require('../repositories/mysql/_users');
let rpoUserOptions = require('../repositories/mysql/_user_options');
let rpoUserAddresses = require('../repositories/mysql/_user_addresses');
let rpoMigrations = require('../repositories/mysql/_migrations');
let moment = require('moment');

exports.contents = async function(req, res, next) {

    let lastMigrated = await rpoMigrations.getLastMigrate('contents')
    let page = 1, limit = 10, offset = 0;

    if (lastMigrated.length > 0) {
        page = lastMigrated[0].page + 1
        limit = lastMigrated[0].limit
    }

    let migrationData = {
        obj : 'contents',
        page: page,
        limit: limit,
        created_at : moment().format()
    }

    await rpoMigrations.put(migrationData)

    let contents = await rpoContents.getSQL(page,limit)
    
    // push to mongoDB
    await contents.forEach(async items => {
        let dupl = await rpoContents.findQuery({content_id:items.content_id})
        console.log("== validating "+items.title+" ==");
        if(dupl.length <= 0) {
            // fetch other data
            // console.log("Fetching content series, rates and comments");
            await rpoContents.put(items)
        }
    })

    console.log("==MIGRATING PAGE "+page+ " OF " +"CONTENTS ==")
 
}

exports.default = async function(table) {

    try {
        let rpo = require("../repositories/mysql/_"+table)
        let lastMigrated = await rpoMigrations.getLastMigrate(table)
        let page = 1, limit = 10, offset = 0;

        // console.log("last migrated", lastMigrated);
        if (lastMigrated.length > 0) {
            page = lastMigrated[0].page + 1
            limit = lastMigrated[0].limit
        }

        let migrationData = {
            obj : table,
            page: page,
            limit: limit,
            created_at : moment().format()
        }

        
        let contents = await rpo.getSQL(page,limit)
        // console.log(contents.length);
        if(contents.length > 0) {
            
            await rpoMigrations.put(migrationData)

            await contents.forEach(async items => {
                let dupl = await rpo.findQuery({id:items.id})
    
                if(dupl.length <= 0) {
                    await rpo.put(items)
                }
            })

            console.log("==MIGRATING PAGE "+page+ " OF " + table +"==")
        }
        
    } catch (err) {
        console.log(err)
        console.log("Can't Find repository ")
    }

    

 
}


exports.users = async function(req, res, next) {

    let lastMigrated = await rpoMigrations.getLastMigrate('users-v2')
    let page = 1, limit = 10, offset = 0;

    if (lastMigrated.length > 0) {
        page = lastMigrated[0].page + 1
        limit = lastMigrated[0].limit
    }

    let migrationData = {
        obj : 'users-v2',
        page: page,
        limit: limit,
        created_at : moment().format()
    }

    

    let users = await rpoUsers.getSQL(page,limit)

    if (users.length > 0) {
        
        // push to mongoDB
        await users.forEach(async user => {

            let dupl = await rpoUsers.findQuery({id:user.id})
            console.log("== validating "+user.name+" ==");

            // fetch other data | user_options | user_addresses
            let addresses = await rpoUserAddresses.getUserData(user.id)
            user.addresses = addresses

            let userOptions = await rpoUserOptions.getUserData(user.id)
            user.userOptionsData = userOptions

            if(dupl.length <= 0 ) {
                console.log("**************** Added new record ********************");
                await rpoUsers.put(user)
            } else {
                let userId = user.id
                delete user.id
                console.log("**************** Updated record ********************");
                await rpoUsers.update(userId,user)

            }

            
        })

        await rpoMigrations.put(migrationData)

    }
    
    

    console.log("==MIGRATING PAGE "+page+ " OF " +"USERS ==")
 
}
