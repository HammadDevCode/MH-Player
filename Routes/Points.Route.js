const express = require("express")
const { verifyAccessToken } = require("../helpers/jwt_helper")
const { getUserData } = require("../helpers/Auth_helper")
const router = express.Router()
const {Level, DailyPointsSchema, User} = require("../Models/User.Model")
const createError = require("http-errors")
const mongoose = require("mongoose")
const { DateModelName, RandomInt, RandomizeToIntList, addErrorToUser } = require("../helpers/custom_functions")


router.post("/add-video-points", verifyAccessToken, getUserData,async  (req, res, next) =>{
    try {



        

        const DailyPoints = mongoose.model(DateModelName(), DailyPointsSchema)












        const userId = req.payload.aud
        const dailyPoints = await DailyPoints.findOne({userId})
        if(dailyPoints){
            const level = await Level.findOne({level: req.user.level})

            if(!level) throw createError.InternalServerError()

            const maximumPoints = level.dailyPoints.videoPlaying

            const newPoints = dailyPoints.earnedPoints.videoPlaying + level.addPointsPerSec
            if(newPoints < maximumPoints){
                const result = await DailyPoints.updateOne({userId}, {earnedPoints:{...dailyPoints.earnedPoints, videoPlaying: newPoints}})
                if(result.modifiedCount){
                    res.send({message: "Points Added", Points: newPoints})
                }else {
                    res.send({message: "Points Not Added"})
                }


            } else {
                const result = await DailyPoints.updateOne({userId}, {earnedPoints:{...dailyPoints.earnedPoints, videoPlaying: maximumPoints}})
                    res.send({message: "All Points are collected", Points: maximumPoints})
            }

        } else{
            const savedDailyPoints = new DailyPoints({userId})
            await savedDailyPoints.save()
            res.send({message: "Daily Points Added", Points: 0})
        }
        } catch (error) {
            next(error)
            
        }
    
})




router.post("/add-audio-points", verifyAccessToken, getUserData,async  (req, res, next) =>{
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

router.get("/get-collectable-points-list", verifyAccessToken, async(req, res, next)=>{
    

    const DailyPoints = mongoose.model(DateModelName(), DailyPointsSchema)
    const userId = req.payload.aud
    const dailyPoints = await DailyPoints.findOne({userId})





    const videoEarnedPoint = dailyPoints.earnedPoints.videoPlaying
    const videoCollectedPoint = dailyPoints.collectedPoints.videoPlaying

    const audioEarnedPoint = dailyPoints.earnedPoints.audioPlaying
    const audioCollectedPoint = dailyPoints.collectedPoints.audioPlaying

    const collectableVideoPoints = videoEarnedPoint - videoCollectedPoint
    const collectableAudioPoints = audioEarnedPoint - audioCollectedPoint
    
    const videoPointsList = RandomizeToIntList(collectableVideoPoints, 200, 500)
    const audioPointsList = RandomizeToIntList(collectableAudioPoints, 200, 500)

    res.send({videoPointsList, audioPointsList})



    
})


router.post("/collect-video-points", verifyAccessToken, getUserData, async (req, res, next) =>{

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
        return res.send({message: "All Points Are Collected"})
    }


    if(videoCollectedPoint  > videoEarnedPoint){
        await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, videoPlaying: videoEarnedPoint}})

        addErrorToUser(userId, ({message: "Points exceded", videoCollectedPoint, videoEarnedPoint,
         breakCondition: "videoCollectedPoint  > videoEarnedPoint", resolvedWith: 
         {tags: "collectedPoints.videoPlaying = videoEarnedPoint", values: `collectedPoints.videoPlaying = ${videoEarnedPoint}`}}))

        return res.send({message: "All Points Are Collected"})
    }
    
    if(videoCollectedPoint > maximumPoints){
        await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, videoPlaying: level.dailyPoints.videoPlaying}})

        addErrorToUser(userId, ({message: "Points exceded", videoCollectedPoint, maximumPoints,
         breakCondition: "videoCollectedPoint  > maximumPoints", resolvedWith:
          {tags: "collectedPoints.videoPlaying = maximumPoints", values: `collectedPoints.videoPlaying = ${level.dailyPoints.videoPlaying}`}}))
        
        return res.send({message: "All Points Are Collected"})
    }




   
    if(points > videoEarnedPoint - videoCollectedPoint){
        return next(createError.BadRequest())
    }



    if(newDivide > divide && !rewardedAd){
        res.status(201).send({videoAdRequired: true})
    }else {
        if((videoCollectedPoint + points) > maximumPoints){
            await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, videoPlaying: maximumPoints}})
            return res.send({message: "All Points Are Collected"})
        }


    
        


 
        const session = await mongoose.connection.startSession()
        try {
            await session.startTransaction()
            await DailyPoints.updateOne({userId}, {collectedPoints:
                {...dailyPoints.collectedPoints, videoPlaying: videoCollectedPoint+points}},{session:session})


                await User.updateOne({_id:userId}, {$inc: {points}}, {session: session})




            await session.commitTransaction()
            res.send({message: "points Collected"})

        } catch (error) {
            (await session).abortTransaction()
            console.log(error);
            res.send({message: "Failed to collect points"})
        }

        (await session).endSession()
        
    }

    

})



router.post("/collect-audio-points", verifyAccessToken, getUserData, async (req, res, next) =>{

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
        return res.send({message: "All Points Are Collected"})
    }


    if(audioCollectedPoint  > audioEarnedPoint){
        await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, audioPlaying: audioEarnedPoint}})

        addErrorToUser(userId, ({message: "Points exceded", audioCollectedPoint, audioEarnedPoint,
         breakCondition: "audioCollectedPoint  > audioEarnedPoint", resolvedWith: 
         {tags: "collectedPoints.audioPlaying = audioEarnedPoint", values: `collectedPoints.audioPlaying = ${audioEarnedPoint}`}}))

        return res.send({message: "All Points Are Collected"})
    }
    
    if(audioCollectedPoint > maximumPoints){
        await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, audioPlaying: level.dailyPoints.audioPlaying}})

        addErrorToUser(userId, ({message: "Points exceded", audioCollectedPoint, maximumPoints,
         breakCondition: "audioCollectedPoint  > maximumPoints", resolvedWith:
          {tags: "collectedPoints.audioPlaying = maximumPoints", values: `collectedPoints.audioPlaying = ${level.dailyPoints.audioPlaying}`}}))
        
        return res.send({message: "All Points Are Collected"})
    }




   
    if(points > audioEarnedPoint - audioCollectedPoint){
        return next(createError.BadRequest())
    }



    if(newDivide > divide && !rewardedAd){
        res.status(201).send({audioAdRequired: true})
    }else {
        if((audioCollectedPoint + points) > maximumPoints){
            await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, audioPlaying: maximumPoints}})
            return res.send({message: "All Points Are Collected"})
        }

        await DailyPoints.updateOne({userId}, {collectedPoints:{...dailyPoints.collectedPoints, audioPlaying: audioCollectedPoint+points}})
        res.send({message: "points added."})
    }

    

})

module.exports = router