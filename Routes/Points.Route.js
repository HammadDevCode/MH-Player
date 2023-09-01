const express = require("express")
const { verifyAccessToken } = require("../helpers/jwt_helper")
const { getUserData } = require("../helpers/Auth_helper")
const router = express.Router()
const {Level, DailyPointsSchema, User} = require("../Models/User.Model")
const createError = require("http-errors")
const mongoose = require("mongoose")
const { DateModelName, RandomInt, RandomizeToIntList, addErrorToUser, PreviousDateModelName, checkIfPointsSectionClosed } = require("../helpers/custom_functions")



// verifyAccessToken, getUserData required
const getAllDetails = async(req, res, next) =>{
    // try {
        
        const PreviousDailyPoints = mongoose.model(PreviousDateModelName(), DailyPointsSchema)
        const DailyPoints = mongoose.model(DateModelName(), DailyPointsSchema)

        const userId = req.payload.aud
        const {videoEarnedPoints, audioEarnedPoints} = req.body
        var dailyPoints = await DailyPoints.findOne({userId})
        const previousDailyPoints = await PreviousDailyPoints.findOne({userId})
        if(!dailyPoints){ 

            dailyPoints = await new DailyPoints({userId}).save()

        } else{
            await DailyPoints.updateOne({userId}, {earnedPoints: {...dailyPoints.earnedPoints, videoPlaying: videoEarnedPoints, audioPlaying: audioEarnedPoints}})
            dailyPoints = await DailyPoints.findOne({userId})
        }

        const level = await Level.findOne({level: req.user.level})
        if(!level) return next(createError.InternalServerError()) 

        // Get collectable Points lis
        const videoEarnedPoint = dailyPoints.earnedPoints.videoPlaying
        const videoCollectedPoint = dailyPoints.collectedPoints.videoPlaying
        const audioEarnedPoint = dailyPoints.earnedPoints.audioPlaying
        const audioCollectedPoint = dailyPoints.collectedPoints.audioPlaying
        const collectableVideoPoints = videoEarnedPoint - videoCollectedPoint
        const collectableAudioPoints = audioEarnedPoint - audioCollectedPoint
        const videoPointsList = RandomizeToIntList(collectableVideoPoints, 200, 500)
        const audioPointsList = RandomizeToIntList(collectableAudioPoints, 200, 500)
        // Get collectable Points list

        // spin section
        const numberOfSpins = dailyPoints.spin.numberOfSpins
        const spinPrice = level.spin.spinPrice[numberOfSpins]
        const maxNoOfSpins = level.spin.maxNoOfSpins

        // daily check-in
        var dailyCheckInIndex
        if(!previousDailyPoints) {
            dailyCheckInIndex = 0
        } else{
            // dailyCheckInIndex = level.dailyCheckIn.rewards.indexOf(previousDailyPoints.dailyCheckIn)
            dailyCheckInIndex = level.dailyCheckIn.rewards.indexOf(previousDailyPoints.dailyCheckIn)
            dailyCheckInIndex = dailyCheckInIndex % 7
            if(dailyCheckInIndex == 6)  
                dailyCheckInIndex = 0 
            else 
                dailyCheckInIndex++
        }





        return {dailyPoints: {videoEarnedPoints: dailyPoints.earnedPoints.videoPlaying,
            audioEarnedPoints: dailyPoints.earnedPoints.audioPlaying,
            videoCollectedPoints: dailyPoints.collectedPoints.videoPlaying,
            audioCollectedPoints: dailyPoints.collectedPoints.audioPlaying,
            videoMaximumPoints: level.dailyPoints.videoPlaying,
            audioMaximumPoints: level.dailyPoints.audioPlaying,
            addPointsPerSec: level.addPointsPerSec}, 

            user: req.user,

            getCollectablePointsList: {videoPointsList, audioPointsList},
        
            spin:{
                spinPrice,
                numberOfSpins,
                maxNoOfSpins
            },
            dailyCheckIn:{
                dailyCheckInIndex,
                dailyCheckInReward: level.dailyCheckIn.rewards[dailyCheckInIndex],
                dailyCheckInAdType: level.dailyCheckIn.adType[dailyCheckInIndex],
                dailyCheckInCompleted: dailyPoints.dailyCheckIn == 0? false : true,
                dailyCheckInRewards: level.dailyCheckIn.rewards
            }}

       

    // } catch (error) {
    //     console.log(Error);
    //     return next(createError.InternalServerError())
    // }
}


router.post("/get-all-details", verifyAccessToken, checkIfPointsSectionClosed, getUserData, async  (req, res, next) =>{
    try {
        
        const allDetails = await getAllDetails(req, res, next)

        res.send({allDetails})
           

        } catch (error) {
            console.log(error);
            next(error)
            
        }
    
})


router.post("/add-audio-points", verifyAccessToken, checkIfPointsSectionClosed, getUserData,async  (req, res, next) =>{
    try {




        
        const DailyPoints = mongoose.model(DateModelName(), DailyPointsSchema)









        const userId = req.payload.aud
        const dailyPoints = await DailyPoints.findOne({userId})
        if(dailyPoints){
            const level = await Level.findOne({level: req.user.level})

            if(!level) throw createError.InternalServerError()

            const maximumPoints = level.dailyPoints.audioPlaying

            const newPoints = dailyPoints.earnedPoints.audioPlaying + level.addPointsPerSec
            if(newPoints < maximumPoints){
                const result = await DailyPoints.updateOne({userId}, {earnedPoints:{...dailyPoints.earnedPoints, audioPlaying: newPoints}})
                if(result.modifiedCount){
                    res.send({message: "Points Added", Points: newPoints})
                }else {
                    res.send({message: "Points Not Added"})
                }


            } else {
                const result = await DailyPoints.updateOne({userId}, {earnedPoints:{...dailyPoints.earnedPoints, audioPlaying: maximumPoints}})
                    res.send({message: "All Points are collected", Points: maximumPoints})
            }

        } else{
            const savedDailyPoints = new DailyPoints({userId})
            await savedDailyPoints.save()
            res.send({message: "Daily Points Added", Points: "0"})
        }
        } catch (error) {
            next(error)
            
        }
    
})


// deprecated
// router.get("/get-collectable-points-list", verifyAccessToken, async(req, res, next)=>{
    

//     const DailyPoints = mongoose.model(DateModelName(), DailyPointsSchema)
//     const userId = req.payload.aud
//     const dailyPoints = await DailyPoints.findOne({userId})





//     const videoEarnedPoint = dailyPoints.earnedPoints.videoPlaying
//     const videoCollectedPoint = dailyPoints.collectedPoints.videoPlaying

//     const audioEarnedPoint = dailyPoints.earnedPoints.audioPlaying
//     const audioCollectedPoint = dailyPoints.collectedPoints.audioPlaying

//     const collectableVideoPoints = videoEarnedPoint - videoCollectedPoint
//     const collectableAudioPoints = audioEarnedPoint - audioCollectedPoint
    
//     const videoPointsList = RandomizeToIntList(collectableVideoPoints, 200, 500)
//     const audioPointsList = RandomizeToIntList(collectableAudioPoints, 200, 500)

//     res.send({videoPointsList, audioPointsList})



    
// })


router.post("/collect-video-points", verifyAccessToken, checkIfPointsSectionClosed, getUserData, async (req, res, next) =>{

    const DailyPoints = mongoose.model(DateModelName(), DailyPointsSchema)





    const {points, rewardedAd} = req.body
    const userId = req.payload.aud
    const dailyPoints = await DailyPoints.findOne({userId})
    const level = await Level.findOne({level: req.user.level})
    const videoEarnedPoint = dailyPoints.earnedPoints.videoPlaying
    const videoCollectedPoint = (dailyPoints.collectedPoints.videoPlaying)
    const adAfterPoints = (level.adAfterPoints)
    const maximumPoints = (level.dailyPoints.videoPlaying)

    const divide = parseInt(videoCollectedPoint / adAfterPoints)
    const newDivide = parseInt((videoCollectedPoint + points) / adAfterPoints)

    if(videoCollectedPoint  == videoEarnedPoint && videoCollectedPoint == maximumPoints){
        return next(createError.Conflict("All Points Are Collected"))
    }


    if(videoCollectedPoint  > videoEarnedPoint){
        await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, videoPlaying: videoEarnedPoint}})

        addErrorToUser(userId, ({message: "Points exceded", videoCollectedPoint, videoEarnedPoint,
         breakCondition: "videoCollectedPoint  > videoEarnedPoint", resolvedWith: 
         {tags: "collectedPoints.videoPlaying = videoEarnedPoint", values: `collectedPoints.videoPlaying = ${videoEarnedPoint}`}}))

         return next(createError.Conflict("All Points Are Collected"))
    }
    
    if(videoCollectedPoint > maximumPoints){
        await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, videoPlaying: level.dailyPoints.videoPlaying}})

        addErrorToUser(userId, ({message: "Points exceded", videoCollectedPoint, maximumPoints,
         breakCondition: "videoCollectedPoint  > maximumPoints", resolvedWith:
          {tags: "collectedPoints.videoPlaying = maximumPoints", values: `collectedPoints.videoPlaying = ${level.dailyPoints.videoPlaying}`}}))
        
          return next(createError.Conflict("All Points Are Collected"))
    }




   
    if(points > videoEarnedPoint - videoCollectedPoint){
        return next(createError.BadRequest("Points can't be collected"))
    }



    if(newDivide > divide && !rewardedAd){
        return next(createError.PaymentRequired())
    }else {
        if((videoCollectedPoint + points) > maximumPoints){
            await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, videoPlaying: maximumPoints}})

            return next(createError.Conflict("All Points Are Collected"))
        }


    
        


 
        const session = await mongoose.connection.startSession()
        try {
            await session.startTransaction()
            await DailyPoints.updateOne({userId}, {collectedPoints:
                {...dailyPoints.collectedPoints, videoPlaying: videoCollectedPoint+points}},{session:session})


                await User.updateOne({_id:userId}, {$inc: {points}}, {session: session})



            await session.commitTransaction()
            const allDetails = await getAllDetails(req, res, next)
            res.send({message: "points Collected", points, allDetails})

        } catch (error) {
            await session.abortTransaction()
            console.log(error);

            next(createError.Forbidden("Failed to collect points"))
        }

        await session.endSession()
        
    }

    

})



router.post("/collect-audio-points", verifyAccessToken, checkIfPointsSectionClosed, getUserData, async (req, res, next) =>{

    const DailyPoints = mongoose.model(DateModelName(), DailyPointsSchema)


    



    const {points, rewardedAd} = req.body
    const userId = req.payload.aud
    const dailyPoints = await DailyPoints.findOne({userId})
    const level = await Level.findOne({level: req.user.level})
    const audioEarnedPoint = dailyPoints.earnedPoints.audioPlaying
    const audioCollectedPoint = (dailyPoints.collectedPoints.audioPlaying)
    const adAfterPoints = (level.adAfterPoints)
    const maximumPoints = (level.dailyPoints.audioPlaying)

    const divide = parseInt(audioCollectedPoint / adAfterPoints)
    const newDivide = parseInt((audioCollectedPoint + points) / adAfterPoints)

    if(audioCollectedPoint  == audioEarnedPoint && audioCollectedPoint == maximumPoints){
        return next(createError.Conflict("All Points Are Collected"))
    }


    if(audioCollectedPoint  > audioEarnedPoint){
        await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, audioPlaying: audioEarnedPoint}})

        addErrorToUser(userId, ({message: "Points exceded", audioCollectedPoint, audioEarnedPoint,
         breakCondition: "audioCollectedPoint  > audioEarnedPoint", resolvedWith: 
         {tags: "collectedPoints.audioPlaying = audioEarnedPoint", values: `collectedPoints.audioPlaying = ${audioEarnedPoint}`}}))

         return next(createError.Conflict("All Points Are Collected"))
    }
    
    if(audioCollectedPoint > maximumPoints){
        await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, audioPlaying: level.dailyPoints.audioPlaying}})

        addErrorToUser(userId, ({message: "Points exceded", audioCollectedPoint, maximumPoints,
         breakCondition: "audioCollectedPoint  > maximumPoints", resolvedWith:
          {tags: "collectedPoints.audioPlaying = maximumPoints", values: `collectedPoints.audioPlaying = ${level.dailyPoints.audioPlaying}`}}))
        
          return next(createError.Conflict("All Points Are Collected"))
    }




   
    if(points > audioEarnedPoint - audioCollectedPoint){
        return next(createError.BadRequest("Points can't be collected"))
    }



    if(newDivide > divide && !rewardedAd){
        return next(createError.PaymentRequired())
    }else {
        if((audioCollectedPoint + points) > maximumPoints){
            await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, audioPlaying: maximumPoints}})

            return next(createError.Conflict("All Points Are Collected"))
        }


    
        


 
        const session = await mongoose.connection.startSession()
        try {
            await session.startTransaction()
            await DailyPoints.updateOne({userId}, {collectedPoints:
                {...dailyPoints.collectedPoints, audioPlaying: audioCollectedPoint+points}},{session:session})


                await User.updateOne({_id:userId}, {$inc: {points}}, {session: session})




            await session.commitTransaction()
            const allDetails = await getAllDetails(req, res, next)
            res.send({message: "points Collected", points, allDetails})

        } catch (error) {
            await session.abortTransaction()
            console.log(error);

            next(createError.Forbidden("Failed to collect points"))
        }

        await session.endSession()
        
    }


    

})



router.post("/daily-check-in", verifyAccessToken, checkIfPointsSectionClosed, getUserData, async (req, res, next) =>{

    const userId = req.payload.aud
    const level = await Level.findOne({level: req.user.level})
    if(!level) return next(createError.InternalServerError())

    const PreviousDailyPoints = mongoose.model(PreviousDateModelName(), DailyPointsSchema)
    const DailyPoints = mongoose.model(DateModelName(), DailyPointsSchema)
    const previousDailyPoints = await PreviousDailyPoints.findOne({userId})


    var dailyCheckInIndex
    if(!previousDailyPoints) {
        dailyCheckInIndex = 0
    } else{
        // dailyCheckInIndex = level.dailyCheckIn.rewards.indexOf(previousDailyPoints.dailyCheckIn)
        dailyCheckInIndex = level.dailyCheckIn.rewards.indexOf(previousDailyPoints.dailyCheckIn)
        dailyCheckInIndex = dailyCheckInIndex % 7
        if(dailyCheckInIndex == 6)  
            dailyCheckInIndex = 0 
        else 
            dailyCheckInIndex++
    }

    console.log(DateModelName());



    let dailyPoints = await DailyPoints.findOne({userId})
    if(!dailyPoints) dailyPoints = await new DailyPoints({userId}).save()



    const session = await mongoose.startSession()

    if(dailyPoints.dailyCheckIn == 0){

        /// session.startTransaction()
        const reward = level.dailyCheckIn.rewards[dailyCheckInIndex]
        console.log(reward);
        dailyPoints = await DailyPoints.findOneAndUpdate({userId}, { dailyCheckIn:reward}, {session})
        if(dailyPoints.isModified){
            await User.updateOne({_id: userId}, {$inc:{points: reward}}, {session})
            const allDetails = await getAllDetails(req, res, next)
            /// await session.commitTransaction()
            console.log(allDetails);
            return res.send({message: "Points are collected", allDetails})
        }else {
            /// await session.abortTransaction();
            return next(createError.BadRequest("Points Already Collected"))
        }
    }else {
        return next(createError.BadRequest("Points Already Collected"))

        
    }



})



router.post("/spin-to-earn", verifyAccessToken, checkIfPointsSectionClosed, getUserData, async (req, res, next) =>{

    // const session = await mongoose.startSession()
    
    try {
        // await session.startTransaction()
        

        const {adRequired} = req.body
        const userId = req.payload.aud
        const level = await Level.findOne({userId})
        if(!level) return next(createError.InternalServerError())
    
        const DailyPoints = mongoose.model(DateModelName(), DailyPointsSchema)
        const dailyPoints = await DailyPoints.findOne({userId})
        if(!dailyPoints) dailyPoints = await new DailyPoints({userId}).save()
    
        if(dailyPoints.spin.numberOfSpins >= level.spin.maxNoOfSpins) return next(createError.BadRequest("Max limit raeched"))
    
        if(typeof level.spin.spinPrice[dailyPoints.spin.numberOfSpins] === 'string'){
            // ad is required
            if(adRequired == level.spin.spinPrice[dailyPoints.spin.numberOfSpins]){
                // requireed ad rewarded
            }else {
                return next(createError.BadRequest("Ad is required"))
            }
        }else if(typeof level.spin.spinPrice[dailyPoints.spin.numberOfSpins] === 'number'){
            // cost required 
            if(req.user.points >= level.spin.spinPrice[dailyPoints.spin.numberOfSpins]){
                // points available in users account
    
                // Detect Points from users accounts
                await User.updateOne({_id: userId}, {$inc: {points: -level.spin.spinPrice[dailyPoints.spin.numberOfSpins]}}, {session})
    
            }else {
                // points are not enough to spin
                return next(createError.BadRequest("Points are not enough to spin"))
            }
            
        } else{
            return next(createError.InternalServerError())
        }
        
        // spin random and reward
    
        const itemIndex = RandomInt(0, 7)
    
        const reward = level.spin.spinRewards[itemIndex]
        
        await DailyPoints.updateOne({userId}, {spin:{...dailyPoints.spin, $inc:{numberOfSpins: 1}, $push:{spinReward: reward, spinPrice: level.spin.spinPrice[dailyPoints.spin.numberOfSpins]}}}, {session})
    
        await User.updateOne({_id: userId}, {$inc: {points: reward}}, {session})
    
        // await session.commitTransaction()
        const allDetails = await getAllDetails(req, res, next)
        res.send({message: "Spin Rewarded", itemIndex, reward, allDetails})


    } catch (error) {
        console.log(error);
        // await session.abortTransaction()
        return next(createError.InternalServerError())
        
    }






})









module.exports = router