const mongoose = require("mongoose")

mongoose.set(
    'strictQuery', true)
mongoose.connect(process.env.MONGODB_URL, 
{dbName: process.env.DB_NAME,
useNewUrlParser: true,
useUnifiedTopology: true,
// replicaSet: rs
// retryWrites: false
// useFindAndModify: false,
// useCreateIndex: true
})
.then(()=>{
    console.log("mongodb connected");
})
.catch((err) =>console.log(err.message)) 


mongoose.connection.on('connected', () =>{
    console.log('mongoose conected to db');
})

mongoose.connection.on("error", (err) =>{
    console.log(err.message);
})

mongoose.connection.on('disconnected', () =>{
    console.log("mongoose connectiong os disconnected.");
})


process.on("SIGINT", async () =>{
    await mongoose.connection.close();
    process.exit(0)
})