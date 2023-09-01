const express = require("express");
const router = express.Router();
const yt = require("ytdl-core")


router.get("/:id", (req, res, next) =>{
    const {id} = req.params;
    const url = `https://www.youtube.com/watch?v=${id}`;
    
    yt.getInfo(url).then((response)=>{
        res.setHeader("Content-Type", "application/json")
        res.status(200).send(JSON.stringify(response))
        }).catch((error)=>{
            console.log(error);
            res.status(404).send("error")
    
        }).finally(()=>{
    
        })

})




export default router