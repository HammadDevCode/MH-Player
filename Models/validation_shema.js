const joi = require("@hapi/joi")



const AuthRegistrationSchema = joi.object({
    email:joi.string().email().lowercase().required(),
    password: joi.string().min(8).required(),
    confirmPassword: joi.ref('password'),
    firstName: joi.string().min(3).required(),
    lastName: joi.string().min(3).required(),
    cloningDetection: joi.object({
        appInstalledPath: joi.string().required().label("Error while Registeration"),
        packageName: joi.string().required().label("Error while Registeration")
    }).required()
})


const AuthLoginSchema = joi.object({
    email:joi.string().email().lowercase().required(),
    password: joi.string().min(8).required()
})


module.exports = {
    AuthRegistrationSchema, AuthLoginSchema
}