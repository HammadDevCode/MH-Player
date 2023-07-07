const joi = require("@hapi/joi")



const AuthRegistrationSchema = joi.object({
    firstName: joi.string().min(3).required().messages({'string.min': "First Name is not seemed to be Correct", 'string.empty': "First Name is not allowed to be empty"}),
    lastName: joi.string().min(3).required().messages({'string.min': "Last Name is not seemed to be Correct", 'string.empty': "Last Name is not allowed to be empty"}),
    email:joi.string().email().lowercase().required().messages({'string.email': "Email is not valid", 'string.empty': "Email is not allowed to be empty"}),
    password: joi.string().min(8).required().messages({"string.empty": "Password is not allowed to be empty", "string.min": "Password is too weak", "string.ref": "pas"}),
    confirmPassword: joi.ref('password'),
    referralCode: joi.string(),
    cloningDetection: joi.object().required().messages({'any.required':"Error While Registration"})
})


const AuthLoginSchema = joi.object({
    email:joi.string().email().lowercase().required(),
    password: joi.string().min(8).required()
})


module.exports = {
    AuthRegistrationSchema, AuthLoginSchema
}