let tableName = "orders";
let _table = tableName;
var Model = require('../_model')
var defaultModel = new Model(_table)

let conn = require('../../config/DbConnect');

// MYSQL
var mysql = require('mysql');

var con = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
});

var conCpodLogging = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: "chinesepod_logging",
});




module.exports = {

    // BASE FUNCTIONS LOCATED IN defaultModel
    get : async function() {
        return await defaultModel.get()
    },
    find : async function(id) {
        return await defaultModel.find(id)
	},
	findQuery : async function(query) {
        return await defaultModel.findQuery(query)
	},
	update : async function(id,data) {
        return await defaultModel.update(id,data)
    },
	put : async function(data) {
        return await defaultModel.put(data)
    },
    remove : async function(id) {
        return await defaultModel.remove(id)
    },

    // ADD CUSTOM FUNCTION BELOW ========================
    // ==================================================

    getOrders : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            id,
                            transaction_id as transactionId,
                            serial_id as serialId,
                            serial_total as serialTotal,
                            recurring_payment_id as recurringPaymentId,
                            recurring as recurringAmount,
                            product_id as productId,
                            product2015_id as product2015Id,
                            user_id as userId,
                            promo_code as promoCode,
                            payment as payment,
                            billed_amount as billedAmount,
                            pay_status as payStatus,
                            pay_method as payMethod,
                            action_type as actionType,
                            finished,
                            start_date as startDate,
                            end_date as endDate,
                            created_at as createdAt,
                            updated_at as updatedAt,
                            notes,
                            hidden as hidden,
                            user_site_link_id as userSiteLinkId,
                            outstanding_value as outstandingValue,
                            credit_before as creditBefore,
                            credit_after as creditAfter,
                            deduction,
                            site_id as siteId,
                            subscription_id as subscriptionId,
                            pay_zero as payZero,
                            pp_profile_id as ppProfileId,
                            balance,
                            refundable_amount as refundableAmount
                        FROM ${tableName}
                        WHERE id=${id}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getOrderType : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            order_type as type
                        FROM order_type
                        WHERE order_id=${id}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getOrderAdditions : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            from_id as fromId,
                            native
                        FROM orders_additions
                        WHERE order_id=${id}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getOrderPromotions : async function(id){
        return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            p.product_id as productId,
                            p.name as promoName,
                            p.code as promoCode,
                            p.type as promoType,
                            p.value as promoValue
                        FROM orders_to_promotions op
                        LEFT JOIN promotions p
                        ON p.id=op.promotion_id
                        WHERE order_id=${id}`;
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    
}