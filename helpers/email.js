const nodemailer = require("nodemailer")


module.exports = {
   sendEmail: async (email, subject, text)=>{
    return await new Promise(async (resolve, reject) =>{

            const transporter = nodemailer.createTransport({
                host:process.env.HOST,
                service:process.env.SERVICE,
                port:Number(process.env.EMAIL_PORT),
                secure:Boolean(process.env.SECURE),
                auth:{
                    user:process.env.USER,
                    pass:process.env.PASSWORD
                }
            })
            transporter.sendMail({
                from:process.env.USER,
                to:email,
                subject, subject,
                html:text
            },(err,info) =>{
                if(err) return reject("Email not sent")
                console.log("Email sent Successfully to", email);
                resolve()
            })

    })
    }
}