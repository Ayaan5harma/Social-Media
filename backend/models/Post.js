const mongoose = require('mongoose');

const Post_Schema = new mongoose.Schema({
      caption:String,
      image:{
        public_id: String,
        url: String
      },
      owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      createdAt:{
        type:Date,
        default: Date.now
      },
      likes:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"  
            },
          }
      ],
      comments:[
        {
         user:{
           type: mongoose.Schema.Types.ObjectId,
           ref:"User"
         },
         comment:{
            type: String,
            required: true
         }
        }
      ]
})

const post_model = mongoose.model('Post',Post_Schema);

module.exports = post_model;