const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const User_Schema = new mongoose.Schema({
   name:{
    type: String,
    required: [true,"please enter a name"]
   },
   email:{
    type: String,
    required: [true,"please enter a email"],
    unique: [true,"email already exists"]
   },
   password:{
    type:String,
    required: true,
    minlength:[6,"password must be atleast 6 characters"],
    select: false
   }
   ,
   avatar:{
       public_id: String,
       url:String

   },
   posts:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
   ]
   ,
   followers:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"   
    }
   ],
   following:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"   
    }
   ],
   Resetpasswordtoken:{
    type:String,
   },

   Resetpasswordexpires:{
    type:Date
   }
})

User_Schema.pre("save",async function(next){
   
   
  if( this.isModified("password")){
      this.password = await bcrypt.hash(this.password,10);
  }
  next();
})

User_Schema.methods.getResetPasswordToken = ()=>{
 
    const ResetToken = crypto.randomBytes(20).toString("hex");
    this.Resetpasswordtoken = crypto.createHash("sha256").update(ResetToken).digest("hex");
    this.Resetpasswordexpires = Date.now() + 10*60*1000;
    return ResetToken;
}

const User = mongoose.model('User',User_Schema);




module.exports = User;