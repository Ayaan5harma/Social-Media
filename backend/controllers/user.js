const user_model = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const post_model = require('../models/Post');
const { response } = require('express');
const sendEmail = require('../middleware/sendemail');
const crypto = require("crypto");
const RegisterUser =async(req,res)=>{
       
    try {
          const {name,email,password} = req.body;
         
        let user = await user_model.findOne({email:email})
        
            if(user)
            {
                return  res.status(400).send({"success":false,message:"user already exists"});
            }
            
             user = await user_model.create({
                name,
                email,
                password,
                avatar:{
                    public_id: "sampleid",
                    url: "sampleurl"
                }
             })
             const options={
              expires: new Date(Date.now() + 90*24*60*60*1000),
              httpOnly: true,
             }

             const token = jwt.sign({_id:user._id},process.env.JWT_SECRET_KEY)
      res.status(200).cookie("token",token,options).send({
        "Success": true,
        user,
        token
      })
        


    } catch (error) {
        res.status(500).send({"sucess":false,"messgae":error.message})   
    }
    
}




const LoginUser =async (req,res)=>{
    try {
        const {email,password} =req.body;

        const user = await user_model.findOne({email:email}).select("+password");
        if(!user) 
        {
          return  res.status(400).send({"success":false,"message":"No user found"})    
        }
        
    const  isMatch = await bcrypt.compare(password,user.password);
      if(!isMatch){
         return res.status(400).send({"success":false,"message":"invalid credentials"})  
      }
     
     
     const token = jwt.sign({_id:user._id},process.env.JWT_SECRET_KEY)
      res.status(200).cookie("token",token,{
        expires: new Date(Date.now() + 90*24*60*60*1000),
        httpOnly: true,

      }).send({
        "Success": true,
        user,
        token
      })
    
    } catch (error) {
       res.status(500).send({"success":false,"message":error.message})  
    }
}

const LogoutUser = async(req,res)=>{
    try {
        res.status(200).cookie("token",null,{expires:new Date(Date.now()),httpOnly: true}).send({"success":"true" , "message":"loggedOut"})
    } catch (error) {
      res.status(500).send({"success":false,"message":error.message}) 
    }
}

const FollowUser= async (req,res)=>{

  try {
    
    const UserToFollow = await user_model.findById(req.params.id);
    const LoggedInUser =await  user_model.findById(req.user._id);
    
   
    if(!UserToFollow)
    {
      return  res.status(404).send({"success": true,"message": "No user found"});  
    }
    if(LoggedInUser.following.includes(UserToFollow._id))
    {
      const followingindex = LoggedInUser.following.indexOf(UserToFollow._id);
      LoggedInUser.following.splice(followingindex,1);
      await LoggedInUser.save();
      const followerindex = UserToFollow.followers.indexOf(LoggedInUser._id);
      UserToFollow.followers.splice(followerindex,1);
      await UserToFollow.save();
        return res.status(200).send({"success":true,"message": "user UNfollowed"});
    }
    else{
    LoggedInUser.following.push(UserToFollow._id);
    UserToFollow.followers.push(LoggedInUser._id);
    await LoggedInUser.save();
    await UserToFollow.save();
    res.status(200).send({"success": true,"message": "user followed"});
    }
  } catch (error) {
    res.status(500).send({"success": false,"message": error.mesage});
  }



}

const GetFollowingUserPost =async( req,res)=>{
    const user = await user_model.findById(req.user._id);
     const FollwingPersonPosts = await post_model.find({owner:{ $in:user.following}});
    res.status(200).send({"success": true,"posts":FollwingPersonPosts});
   
}

const UpdatePassword = async(req,res)=>{
  try {
     
    const user = await user_model.findById(req.user._id).select("+password");

    const {oldpassword ,newpassword} = req.body;

    if(!oldpassword || !newpassword)
    {
      return res.status(404).send({"success":false,"message":"All fields are required"})
    }
    
 const isMatch = await bcrypt.compare(oldpassword,user.password)
    if(isMatch)
    {
      //already has function of hashpassword in user_model
        user.password = newpassword;
        await user.save();
        return res.status(200).send({"success": true,"message": "password has changed"});
    }
    else{
      return res.status(404).send({"success":false,"message": "Old password does not match"});
    }

    
    


  } catch (error) {
    res.status(500).send({"success": false, "message" : error.message})
  }
}

const UpdateProfile = async(req,res)=>{
try {
  
  const user = await user_model.findById(req.user._id);
  const {name,email} = req.body;
  if(!name && !email)
  {
    return res.status(404).send({"success":false,"message":"All fields are required"})
  }
  if(name) {
    user.name = name;

  }
  if(email){
    user.email = email;
  }
 
  //image to do ...

  await user.save();
  return res.status(200).send({"success": true,"message":"profile updated"})

} catch (error) {
  return res.status(500).send({"success": false,"message":error.message})
}
   
}

const DeleteAccount= async(req,res)=>{
   

    try {
     
      const user = await user_model.findById(req.user._id);
      
        
      //removing that person from followers;
      for(let index=0;index<user.following.length;index++){
          const followeduser = await user_model.findById(user.following[index]);
          console.log(followeduser);
          
          const idx = followeduser.followers.indexOf(user._id);
            followeduser.followers.splice(idx,1);
            await followeduser.save();
         
      }
      
      for(let index=0;index<user.followers.length;index++){
        const myfollower = await user_model.findById(user.followers[index]);

        const idx = myfollower.following.indexOf(user._id);
          myfollower.following.splice(idx,1);
          await myfollower.save();
       
    }
        
      //delete all post associated with user
      for(let index =0;index<user.posts.length;index++)
      {
         const post = await post_model.findById(user.posts[index]);
         await post.remove();
      }
      //delete user
     await user.remove();
     //Logout User
     res.cookie("token",null,{expires: new Date(Date.now()),
     httpOnly: true})

     return res.status(200).send({"success": true,"message":"account deleted"});
    } catch (error) {
      return res.status(500).send({"success": false,"message":error.mesage});
    }
    


}

const MyProfile =async(req,res)=>{

   try {
    const user =await user_model.findById(req.user._id).populate("posts");

    return res.status(200).send({
      "success": true,
      user
    })
   } catch (error) {
       res.staus(500).send({
         "sucess": false,
         "message": error.message
       })
   }
    

}

const GetUserProfile = async(req,res)=>{
     try {
        
         const user = await user_model.findById(req.params.id).populate("posts");
         
         if(!user)
         {
          return res.status(404).send({"success": false, "message": "No user found"});
         }
         console.log(user.posts);
         return res.status(200).send({"success": true, user });
     } catch (error) {
      return res.status(500).send({"success": false, "message": error.mesage});
     }
}

const ForgotPassword =async(req,res)=>{
   

   try {
    const {email} = req.body;

    if(!email)
    {
      return res.status({"success":false,"message":"email is required"});
    }

    const user = await user_model.findOne({email:email});
    if(!user){
      return res.status({"success":false,"message":"No user found"});
    }
    const ResetPasswordToken  = user.getResetPasswordToken();
    console.log(ResetPasswordToken);
     await user.save();

     const ResetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${ResetPasswordToken}`;
    
     
     const message =  `you are requested to reset the password here's is your link to reset password ${ResetUrl}`;
      
     try {
          await sendEmail({
             email: user.email,
             subject : "reset Password",
             message,
          })
          console.log(user.Resetpasswordtoken)
          res.status(200).json({
            "success": true,
            "message": `Email sent to ${user.email}`
          })
     } catch (error) {
         
         user.Resetpasswordtoken = undefined;
         user.Resetpasswordexpires = undefined;
         await user.save();
         res.status(500).json({"success": false,"message": error.message});
     }
      
    } catch (error) {
      return res.status(500).send({"success": false,"message":error.message});
   }
   

}

const ResetPassword = async(req,res)=>{

  try {
  

     const  Resetpasswordtoken = crypto.createHash("sha256").update(req.params.token).digest("hex");
     const user = await user_model.findOne({
      Resetpasswordtoken,
      Resetpasswordexpires:{$gt:Date.now()}
    });
    console.log(user);
     
     if(!user)
     {
        return res.status(401).send({"success":false,"message": "token is invalid or has expired"});
     }

     const {newpassword,confirmpassword} = req.body;
     if(!password || !confirmpassword)
     {
      return res.status(401).send({"success":false,"message": "All fields are required"});
     }
     if(password!==confirmpassword)
     {
      return res.status(401).send({"success":false,"message": "password does not match"});
     }

     user.password = newpassword;
     user.Resetpasswordtoken = undefined;
     user.Resetpasswordexpires = undefined;
     await user.save();
     return res.status(200).send({"success":true,"message": "password reset successfully"});

  } catch (error) {
    return res.status(500).send({"success": false,"message":error.message});
  }



}

module.exports = {RegisterUser ,LoginUser,LogoutUser,
  FollowUser,GetFollowingUserPost,UpdatePassword,
  UpdateProfile,DeleteAccount,MyProfile,GetUserProfile,
ForgotPassword,ResetPassword} 