
let rpoOrders158 = require('../repositories/_orders158')
let rpoOrders = require('../repositories/mysql/_orders')

let moment = require('moment');
const {unserialize} = require('php-serialize');

exports.getOrder = async function(id) {
    
    let returnedData = await rpoOrders.getOrders(id)

    returnedData = returnedData && returnedData.length > 0 ? returnedData[0] : null

    if (!returnedData) return []

        //   add related objects
    returnedData.orderType = await rpoOrders.getOrderType(id)
    returnedData.additions = await rpoOrders.getOrderAdditions(id)
    returnedData.promotions = await rpoOrders.getOrderPromotions(id)

    rpoOrders158.upsert({id:returnedData.id},returnedData)

    return returnedData
}
