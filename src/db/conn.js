const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB).then(()=>{console.log('connected to db')}).catch((error)=>{console.log(error)});