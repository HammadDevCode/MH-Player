const mongoose = require("mongoose")

const StatisticsSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    reason:{
        type: String,
        default: 'Untitled'
    },
    description:{
        type:String
    },
    students:[
        new mongoose.Schema({
            roll_no: {
                type: Number,
                required: true
            },
            obtain_marks: {
                type: Number,
                required: true
            },
            result: {
                type: String,
                required: true,

            },
            fine:{
                type: Number,
                required: true
            },
            paid: {
                type: Boolean,
                required: true,
                default: false
            }


        })
    ],
    total_marks: {
        type: Number,
        required: true
    },
    min_pass_marks:{
        type: Number,
        required: true
    },
    fail_fine:{
        type: Number,
        required: true
    },
    absent_fine: {
        type: Number,
        required: true
    }
})

const StatisticsAccountsSchema = new mongoose.Schema({
    roll_no:{
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
        
})

const StatisticsTransactionsSchema = new mongoose.Schema({
    time_stamp: {
        type: String,
        required: true,
        default: Date.now()
    },
    roll_no: {
        type: Number, 
        required: true
    },
    amount: {
        type: Number,
        required: true
    }

})


const Statistics = mongoose.model("Statistics", StatisticsSchema)
const StatisticsAccounts = mongoose.model("Statistics Accounts", StatisticsAccountsSchema)
const StatisticsTransaction = mongoose.model("Statistics Transactions", StatisticsTransactionsSchema)

module.exports = {Statistics, StatisticsAccounts, StatisticsTransaction}