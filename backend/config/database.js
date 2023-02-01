const mongoose = require('mongoose');


const connectDB = async(uri)=>{
    
    try {
        mongoose.set('strictQuery', false);
        const resp =await mongoose.connect(uri);
        if(resp)
        {
            console.log("database connected");
        }
        else{
            console.log("error in connecting to the database")
        } 
        }
     catch (error) {
        console.log("error in connecting to the database")
    }
}

module.exports = connectDB;