let rpoContents = require('../repositories/mysql/_contents');
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

