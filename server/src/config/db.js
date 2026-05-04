const mongoose = require('mongoose');
const config = require('./config')

async function connectDB(){

    try{
        await mongoose.connect(config.MONGO_URI);
        console.log("connected to DB successfully!");
    }
    catch{
        console.log("error connecting to DB");
    }
}

module.exports = connectDB;