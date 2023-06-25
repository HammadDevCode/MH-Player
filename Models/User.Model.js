const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const {v4 :UIDv4} = require("uuid")
const Schema = mongoose.Schema

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    UID: {
        type: String,
        unique: true
    },
    password: {
        type:String,
        required: true
    },
    registrationTime:{
        type:Date,
        default:Date.now()
    },
    firstName:{
        type:String,
        default:''
    },
    lastName:{
        type:String,
        default:''
    },
    verifications:{
        email:{
            type:Boolean,
            default:false
        }
    },
    level: {
        type: Number,
        default: 1
    },
    withdrawAddress: {
        type: String,
        default: ""
    },
    points: {
        type: Number,
        default: 0
    },
    diamonds: {
        type: Number,
        default: 0
    },
    currencyAmount: {
        type: Number,
        default: 0
    },
    Usererrors: {
        type: Array,
        default: []
    },
    cloningDetection: {
        appInstalledPath: {
            type: String,
            required: true
        },
        packageName:{
            type: String,
            required: true
        }
    }
})

const LevelSchema = new Schema({
    level: {
        type: Number,
        required: true
    },
    dailyPoints: {
        videoPlaying: {
            type: Number,
            required: true
        },
        audioPlaying: {
            type: Number,
            required: true
        }
    },
    adAfterPoints:{
        type: Number,
        required: true
    },
    buyPrice: {
        type: Number,
        required: true
    },
    addPointsPerSec: {
        type: Number,
        required: true
    },
    minimumWithdraw:{
        point:{
            type: Number,
            required: true
        },
        diamonds:{
            type: Number,
            required: true
        },
        currency: {
            type: Number,
            required: true
        }
    }
})

const EmailVerificationSchema = new Schema({
    userId:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date
})


const DailyPointsSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    earnedPoints: {
        videoPlaying: {
            type: Number,
            required: true,
            default: 0
        },
        audioPlaying: {
            type: Number,
            required: true,
            default: 0
        }
    },
    collectedPoints: {
        videoPlaying: {
            type: Number,
            required: true,
            default: 0
        },
        audioPlaying: {
            type: Number,
            required: true,
            default: 0
        }
    }
})


UserSchema.pre('save', async function(next) {
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)

        this.UID = UIDv4()
        next()
    } catch (error) {
        next(error)
    }
})


UserSchema.methods.isValidPassword = async function (password){
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error
        
    }
    
}




const User = mongoose.model("user", UserSchema)
const UserEmailVerification = mongoose.model("User Email Verification", EmailVerificationSchema)
const Level = mongoose.model("level", LevelSchema)
// const DailyPoints = mongoose.model("daily Points", DailyPointsSchema)
module.exports = {User, UserEmailVerification, Level, DailyPointsSchema}