const post_model = require('../models/Post');

const user_model = require('../models/User');

const CreatePost =async (req,res)=>{
    try {
          const NewPostData ={caption: req.body.caption,
            image:{
              public_id: "req.body.public_id",
              url:"req.body.url",

          },
        owner:req.user._id}

       
    
        const NewPost = await post_model.create(NewPostData);
        const user = await user_model.findById(req.user._id);
        user.posts.push(NewPost._id);
        await user.save();

        res.status(200).send({"success":true,"mesage": "post uploaded successfully","post":NewPost});
        


    } catch (error) {
        res.status(500).send({'sucess':false,"error":error.message}) 
    }
}
const DeletePost = async(req,res)=>{

    try {
        
        const post = await post_model.findById(req.params.id);
        if(!post)
        {
            return res.status(404).send({"status": false,"message":"post not found"}); 
        }
       
        if(post.owner.toString()!==req.user._id.toString())
        {
           return res.status(404).send({"status": false,"message":"Unauthorized Access"}); 
        } 
       
       await post.remove();
     
       const user = await user_model.findById(req.user._id);

        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index,1);
        await user.save();
        return res.status(200).send({"status": true,"message":"Post Deleted"});

        }

     catch (error) {
        return res.status(500).send({"status": false,"message":error.message});
    }
}



const LikeUnlikePost =async(req,res)=>{
    try {
        const post = await post_model.findById(req.params.id);
        
       if(!post)
       {
        return res.status(404).send({"success": "false","message":"Post not found"})
       }
       
    
        if( post.likes.some(id => id.equals(req.user._id))){
            
            const index = post.likes.indexOf(req.user._id);
            
            post.likes.splice(index,1);
            await post.save();
           return res.status(200).send({"success": true,"message":"post Unliked"});
        }
        else{
        post.likes.push(req.user._id);
        await post.save();
        return res.status(200).send({"success": true,"message":"post liked"});
        }
    } catch (error) {
        
        res.status(500).send({"success": "false","message":error.message});

    }
}

const AddUpdateComment =async(req,res)=>{

    try {
        
        const post =await post_model.findById(req.params.id);
             
        if(!post)
        {
            return res.status(404).send({"success": "false","message":"Post not found"})  
        }
                  let CommentIndex =-1;
                  
                   post.comments.forEach((item,index)=>{
                        if(item.user.toString()===req.user._id.toString())
                        {
                            CommentIndex = index;
                        }
                   })

        if(CommentIndex!==-1){
             post.comments[CommentIndex].comment = req.body.comment;
             await post.save();
             return res.status(200).send({"success": true,"message":"comment updated"});
        }else{
        post.comments.push({
            user:req.user._id,
            comment : req.body.comment
        })
        await post.save();
        return res.status(200).send({"success": true,"message":"comment added"});
    }
    } catch (error) {
       
        res.status(500).send({"success": "false","message":error.message}); 
    }
}

const DeleteComment=async(req,res)=>{

    try {
         const post = await post_model.findById(req.params.id);
         if(!post)
         {
             return res.status(404).send({"success": "false","message":"Post not found"})  
         }

        // if you are the owner of the post,can delete any comment using commentId 
         if(post.owner.toString()===req.user._id)
         {
            //searching for the commentId
            if(!req.body.commentId)
            {
                return res.status(400).send({"success": true,"message":"commentId is required"});
            }

             post.comments.forEach((item,index)=>{
                if(item._id.toString()===req.body.commentId.toString())
                {
                    return post.comments.splice(index,1);
                }
             })
             await post.save();
             return res.status(200).send({"success": "true","message":"you deleted the comment"});
         }
         else{

            //  user want to delete his own comment on post
            post.comments.forEach((item,index)=>{
                if(item.user.toString()===req.user._id.toString())
                {
                   return post.comments.splice(index,1);

                }
          })
          await post.save();
          return res.status(200).send({"success": true,"message":"your comment is deleted"});
         }
         

    } catch (error) {
        res.status(500).send({"success": "false","message":error.message});  
    }
}


const UpdateCaption= async(req,res)=>{
    try {
        const post = await post_model.findById(req.params.id);

        if(!post)
        {
          return  res.status(404).send({"success": false,"message":"post not found"});
        }

        if(post.owner.toString()!==req.user._id.toString())
        {
            return  res.status(401).send({"success": false,"message":"unauthorized access"});
        }

        const {caption} =req.body;

        
        post.caption = caption;
        await post.save();
        return res.status(200).send({"success": true,"message":"caption updated"});
        
    } catch (error) {
        res.status(500).send({"success": "false","message":error}) 
    }
}
module.exports = {CreatePost,LikeUnlikePost,DeletePost,UpdateCaption,AddUpdateComment,DeleteComment};