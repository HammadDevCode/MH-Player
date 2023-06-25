const joi = require("@hapi/joi")



const AuthRegistrationSchema = joi.object({
    email:joi.string().email().lowercase().required(),
    password: joi.string().min(8).required(),
    confirmPassword: joi.ref('password'),
    firstName: joi.string().min(3).required(),
    lastName: joi.string().min(3).required(),
    cloningDetection: {
        appInstalledPath: joi.string().required().label("Problem with Device"),
        packageName: joi.string().required().label("Problem with Device")
    }
})


const AuthLoginSchema = joi.object({
    email:joi.string().email().lowercase().required(),
    password: joi.string().min(8).required()
})


module.exports = {
    AuthRegistrationSchema, AuthLoginSchema
}