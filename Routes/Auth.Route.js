const router = require("express").Router()
const createError = require("http-errors")
const {User} = require("../Models/User.Model")
const {AuthRegistrationSchema, AuthLoginSchema} = require("../Models/validation_shema")
const {signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken} = require("../helpers/jwt_helper")
const {sendEmail} = require("../helpers/email")
const { getUserData, _sendOtpToEmail, _verifyEmailWithOtp } = require("../helpers/Auth_helper")
const { sendResponse } = require("../helpers/custom_functions")

router.post("/register", async (req, res, next) =>{
    
    try {
        const {firstName, lastName, email, password} = req.body

        const result = await AuthRegistrationSchema.validateAsync(req.body)

        if(!email || !password) throw createError.BadRequest()

        const doesExist = await User.findOne({email: result.email})
        if(doesExist) throw createError.Conflict(`${result.email} is already been registered.`)

        const user = new User(result)
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)
        const refreshToken = await signRefreshToken(savedUser.id)
        res.send({accessToken, refreshToken})



    } catch (error) {
        if(error.isJoi === true) error.status = 422
        next(error)
    }
})


router.post("/login", async (req, res, next) =>{
    try {
        const result = await AuthLoginSchema.validateAsync(req.body)

        const user = await User.findOne({email: result.email})
        if(!user) throw createError.NotFound("User Not registered")
        
        const isMatch = await user.isValidPassword(result.password)
        if(!isMatch) throw createError.Unauthorized("Invalid Email/Password")


        const accessToken = await signAccessToken(user.id)
        const refreshToken = await signRefreshToken(user.id)
        res.send({accessToken, refreshToken, isEmailVerified: user.verifications.email})
    } catch (error) {
        if(error.isJoi === true) return next(createError.Unauthorized("Invalid Email/Password"))
        next(error)
        
    }
})


router.post("/refresh-token", async(req, res, next) =>{
    try {
        const {refreshToken} = req.body
        if(!refreshToken) throw createError.BadRequest()
        
        const userId = await verifyRefreshToken(refreshToken)

        const user = await User.findOne({_id: userId})
        

        const accessToken = await signAccessToken(userId)
        const newRefreshToken = await signRefreshToken(userId)
        res.send({accessToken, refreshToken: newRefreshToken, isEmailVerified: user.verifications.email})




    } catch (error) {
        next(error)
        
    }
})


router.get("/user", verifyAccessToken, getUserData, (req, res, next) =>{
    res.send(req.user)
})

router.post("/send-Otp-Verification-Email", verifyAccessToken, _sendOtpToEmail, (req, res, next)=>{
    return sendResponse(res, 200, "Email verification OTP sent")
})

router.post("/verify-Otp-Verification-Email", verifyAccessToken, _verifyEmailWithOtp,async (req, res, next)=>{
    const _id = req.payload.aud
    const user = await User.findOne({_id:_id})
    await User.updateOne({_id:_id}, {verifications:{...user.verifications, email:true}})
    return sendResponse(res, 200, "Email verified Successfully")
    })


module.exports = router