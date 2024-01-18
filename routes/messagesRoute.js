const express = require("express")
const router = express.Router()
const ChatModel = require("../model/ChatModel")
const UserModel = require("../model/UserModel")
const mongoose = require("mongoose")


router.get("/", (req, res) => {
    const payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user)
    }

    res.status(200).render("inboxPage", payload)
})


router.get("/new", (req, res) => {
    const payload = {
        pageTitle: "New message",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user)
    }

    res.status(200).render("newMessage", payload)
})

router.get("/:chatId", async (req, res) => {
    const userId = req.session.user._id
    const chatId = req.params.chatId
    const isValidId = mongoose.isValidObjectId(chatId);

    const payload = {
        pageTitle: "Chat",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user)
    }


    if (!isValidId) {
        payload.errorMessage = "Chat does not exist or you don't have permission to view it."
        return res.status(200).render("chatsPage", payload)
    }

    let chat = await ChatModel.findOne({ _id: chatId, users: { $elemMatch: { $eq: userId } } }).populate("users")

    if (chat == null) {
        const userFound = await UserModel.findById(chatId);

        if (userFound != null) {
            chat = await getChatByUserId(userFound._id, userId)
        }
    }

    if (chat == null) {
        payload.errorMessage = "Chat does not exist or you don't have permission to view it."
    } else {
        payload.chat = chat
    }

    res.status(200).render("chatsPage", payload)
})


function getChatByUserId(userLoggedInId, otherUserId) {
    return ChatModel.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                { $elemMatch: { $eq: userLoggedInId }},
                { $elemMatch: { $eq: otherUserId }}
            ]
        }
    },
    {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId]
        }
    },
    {
        new: true,
        upsert: true
    })
    .populate("users");
}


module.exports = router