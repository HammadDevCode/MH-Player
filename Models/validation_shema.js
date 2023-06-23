const joi = require("@hapi/joi")



const AuthRegistrationSchema = joi.object({
    email:joi.string().email().lowercase().required(),
    password: joi.string().min(8).required(),
    firstName: joi.string().min(3).required(),
    lastName: joi.string().min(3).required()
})


const AuthLoginSchema = joi.object({
    email:joi.string().email().lowercase().required(),
    password: joi.string().min(8).required()
})


module.exports = {
    AuthRegistrationSchema, AuthLoginSchema
}