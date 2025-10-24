const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title : {type : String , require : true},
    description : {type : String},
    user : { type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    image : {
        type : String,
        required : false
    }
},{timestamps : true})

module.exports = mongoose.model("Post" , postSchema);