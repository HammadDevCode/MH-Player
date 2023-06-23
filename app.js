const express = require("express")
const createError = require("http-errors")
const morgan = require("morgan")
require("dotenv").config()
require("./helpers/init_mongodb")
const AuthRoute = require("./Routes/Auth.Route")
const PointsRoute = require("./Routes/Points.Route")
const { verifyAccessToken } = require("./helpers/jwt_helper")
const { RandomInt } = require("./helpers/custom_functions")



const app = express()
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({extended: true}))














app.use("/auth", AuthRoute)
app.use("/points", PointsRoute)
app.use("/",verifyAccessToken, async (req, res, next) =>{
    
    console.log(req.headers['authorization'])
    res.send("hello from express")
})

app.use((err, req, res, next) =>{
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})


const port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
    
})