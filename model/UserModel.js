const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    profilePic: {
        type: String,
        trim: true,
        default: "/images/profilePic.jpeg"
    },
    coverPhoto: {
        type: String,
        trim: true
    },
    likes: [{ 
        type: ObjectId,
        ref: "Post"
    }],
    retweets: [{ 
        type: ObjectId,
        ref: "Post"
    }],
    following: [{ 
        type: ObjectId,
        ref: "User"
    }],
    followers: [{ 
        type: ObjectId,
        ref: "User"
    }]
}, { timestamps: true })


const UserModel = mongoose.model("User", userSchema)
module.exports = UserModel