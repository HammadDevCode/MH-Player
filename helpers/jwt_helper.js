const JWT = require("jsonwebtoken")

const craeteError = require("http-errors")


module.exports = {
    signAccessToken: (userId) =>{
        return new Promise((resolve, reject) =>{

            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: "1h",
                issuer: process.env.ISSUER,
                audience: userId
            }
            JWT.sign(payload, secret, options, (err, token) =>{
                if(err) {
                    console.log(err.message)
                    return reject(craeteError.InternalServerError())
                }
                resolve(token)

            })
        })

    },
    verifyAccessToken: (req, res, next) =>{
        if(!req.headers["authorization"]) return next(craeteError.Unauthorized())

        const token = req.headers["authorization"].split(" ")[1]
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) =>{

            if(err){
                const message = err.name === "JsonWebTokenError" ? "Unautorized": err.message
                next(craeteError.Unauthorized(message))
            
            }

            req.payload = payload
            next()
        })
    },
    signRefreshToken: (userId) =>{
        return new Promise((resolve, reject) =>{

            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: "15d",
                issuer:process.env.ISSUER,
                audience: userId
            }
            JWT.sign(payload, secret, options, (err, token) =>{
                if(err) {
                    console.log(err.message)
                    return reject(craeteError.InternalServerError())
                }
                resolve(token)

            })
        })

    },
    verifyRefreshToken: (refreshToken)=>{
        return new Promise((resolve, reject) =>{
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload)=>{
                if(err) return reject(craeteError.Unauthorized())
                const userId = payload.aud

                resolve(userId)
            })
        })
    }
}