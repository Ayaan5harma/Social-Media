const user_model = require('../models/User');
const jwt = require('jsonwebtoken');

exports.IsAuthenticated= async(req,res,next)=>{
     try {
        const {token} = req.cookies;

        if(!token){
            return res.status(401).send({"Success": false,"message": "please login first"});
        }
    
        const decoded = await jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user = await user_model.findById(decoded._id);
        next();
    
     } catch (error) {
        
        res.status(500).send({"message": error.message})
     }
   
}