const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const postsSchema = new mongoose.Schema({
    content: {
        type: String, 
        trim: true
    },

    postedBy: {
        type: ObjectId,
        ref: "User"
    },

    pinned: {
        type: Boolean
    },

    likes: [{ 
        type: ObjectId,
        ref: "User"
    }],

    retweetUsers: [{
        type: ObjectId,
        ref: "User"
    }],

    retweetData: {
        type: ObjectId,
        ref: "Post"
    },

    replyTo: {
        type: ObjectId, 
        ref: 'Post' 
    }

}, { timestamps: true })


const PostsModel = mongoose.model("Post", postsSchema)

module.exports = PostsModel