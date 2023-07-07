const { User, UserEmailVerification } = require("../Models/User.Model")
const bcrypt = require("bcrypt")
const { sendEmail } = require("./email")
const { sendResponse } = require("./custom_functions")



module.exports = {
    getUserData: async (req, res, next) =>{
        const _id = req.payload.aud
        const user = await User.findOne({_id})
        user.password = ""
        req.user = user
        next()

    },
// # (Already Reported)      API Call response : Status (208), message : Email verification OTP already sent
// # (Bad Gateway)           API Call response : Status (502), message : Email not sent
// # (Internal Server Error) API Call response : Status (500), message : Failed to send OTP

_sendOtpToEmail: async(req, res, next) =>{
    try {
        
        
        const userId = req.payload.aud

        const user = await User.findOne({_id:userId})
        const email = user.email
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`
        
        const saltRounds = 10
        const hashedOtp = await bcrypt.hash(otp, saltRounds)

        const UserEmailVerificationRecords = await UserEmailVerification.findOne({userId})
        console.log({emailaa: UserEmailVerificationRecords});
        if(UserEmailVerificationRecords){
            if((Date.parse(UserEmailVerificationRecords[0].createdAt)+ 60000) >  Date.now()){
                return sendResponse(res, 208, "Email verification OTP already sent")
            }else {
                await UserEmailVerification.deleteMany({userId})
            }
        }

        const newEmailOtpVerification =  new UserEmailVerification({
            userId,
            otp:hashedOtp,
            createdAt:Date.now(),
            expiresAt:Date.now() + 900000
        });
        await newEmailOtpVerification.save()
        console.log({emailnew: newEmailOtpVerification});

        await sendEmail(email, "Verify your Email."  , `<p>your Email verification One Time Password (OTP) is <b>${otp}</b>. This OTP expires in 15 minutes.</p>`)
        next()

        
    } catch (error) {
        console.log(error);
        if(error == "Email not sent"){
            return sendResponse(res, 502, "Email not sent")
        }else{
            return sendResponse(res, 500, "Failed to send OTP")

        }
    
    }
},
_verifyEmailWithOtp: async (req, res, next)=>{
// # (Not Acceptable)        API Call response : Status (406), message : Email OTP is empty
// # (Not Found)             API Call response : Status (404), message : Email OTP not Verified //otp not found on db
// # (Gateway Timeout)       API Call response : Status (504), message : Email OTP has expired
// # (Forbedden)             API Call response : Status (403), message : Wrong Email OTP
// # (Internal Server Error) API Call response : Status (500), message : Something went wrong

    try {
        const _id = req.payload.aud
        const {otp} = req.body
        if(!otp){
            
                return sendResponse(res, 406, "Email OTP is empty")
        }else{
            const UserEmailVerificationRecords = await UserEmailVerification.find({userId:_id})
            if(UserEmailVerificationRecords.length <=0){
                // no record found
                return sendResponse(res, 404, "Email OTP not Verified")

            }else{
                const {expiresAt} = UserEmailVerificationRecords[0]
                const hashedOtp = UserEmailVerificationRecords[0].otp
                if(expiresAt < Date.now()){
                    // user otp record has expired
                    await UserEmailVerification.deleteMany({userId:_id})
                return sendResponse(res, 504, "Email OTP has expired")
                } else {
                    const validOtp = await bcrypt.compare(otp, hashedOtp)

                    if(!validOtp){
                        return sendResponse(res, 403, "Wrong Email OTP")
                    } else{
                        // succes
                        await UserEmailVerification.deleteMany({userId:_id})
                        next()
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, "Somethig went wrong")
    }
},
}