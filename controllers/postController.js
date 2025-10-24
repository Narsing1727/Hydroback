const mongoose = require("mongoose");
const Post = require("../models/Post")
exports.getAllPost = async (req, res) => {
    try {
        const allPosts = await Post.find().populate("user" , "username").sort({ createdAt: -1 });
     return res.status(200).json({
        allPosts,
        success : true
     })
    } catch (error) {
        console.log(error);
        
    }
}
exports.addPost = async (req , res) => {
    try {
        const userid = req.id;
        const {title , description} = req.body;
        if(!title || !description){
            return res.status(400).json({
                success : false,
                message : "Something is missing"
            })
        }
const imagePath = req.file ? req.file.path : null;
        const newPost = await Post.create({
            title ,
            description,
           user :  userid,
           image : imagePath
        })

        return res.status(200).json({
            success : true,
            message : 'Post Created',
            newPost
        })
    } catch (error) {
        console.log(error);
        
    }
}