const express = require("express")
const { verifyAccessToken } = require("../helpers/jwt_helper")
const { Tranaction, Level, User } = require("../Models/User.Model")
const { getUserData } = require("../helpers/Auth_helper")
const createHttpError = require("http-errors")
const { default: mongoose } = require("mongoose")

const router = express.Router()


const session = await mongoose.startSession()


router.post("/convert-points-to-diamonds",getUserData, verifyAccessToken, async(req, res, next) =>{
    try {
        await session.startTransaction()
        const userId = req.payload.aud
        const {points} = req.body
        const level = await Level.findOne({level: req.user.level})
        if(!level) return next(createHttpError.InternalServerError())

        if(points > level.minimumWithdraw.point) return next(createHttpError.BadRequest("Amount is not correct"))
        if(points > req.user.points) return next(createHttpError.BadRequest("Amount is not correct"))

        const user = await User.updateOne({_id: userId}, {$inc:{points: -points}},session)
    
        const tranaction = await new Tranaction({userId, amount: points, from:"points", to: "diamods", conversionRate: level.conversionRates.pointsToDiamond}).save()

        if(tranaction){
            await session.commitTransaction()
        }else {
            await session.abortTransaction()
        }


    

    
    
        // call webhook

    } catch (error) {
        await session.abortTransaction()
        console.log(error);
    }
})









module.exports = router