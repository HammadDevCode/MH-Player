const { User } = require("../Models/User.Model");



const RandomInt =  (min, max) =>{
    return Math.floor(Math.random() * (max - min + 1) + min)
}


module.exports = {
    sendResponse: (res, status, message, data) =>{
        if(status == 500){
            console.log(data);
        }
        res.status(status)
        res.send({
            status,
            message,
            data
        })
        console.log(`\x1b[33mAPI Call response\x1b[0m : Status \x1b[32m(${status})\x1b[0m, message : ${message}`);
    },
    DateModelName: ()=>{
        const date = new Date()
        const modelName = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`
        return modelName
    },

    PreviousDateModelName: ()=>{
        const date = new Date()

        date.setDate(date.getDate - 1)

        const modelName = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`
        return modelName
    },
    
    RandomizeToIntList: (int, min, max)=>{
        var List = []
    while(int != 0){
        var rnd = RandomInt(min, max)
        if(rnd < int){
            List.push(rnd)
            int -= rnd
        }else {
            List.push(int)
            int = 0
        }
    }

    return List
    },
    SumTheArray: (array)=>{
        array.reduce((a, b)=>a+b)
    },

    addErrorToUser: async (userId, error)=>{

        await User.updateOne({_id:userId}, {$push: {Usererrors: error}})
    }
}