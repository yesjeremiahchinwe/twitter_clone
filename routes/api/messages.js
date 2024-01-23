const express = require("express")
const ChatModel = require("../../model/ChatModel")
const MessageModel = require("../../model/MessageModel")
const NotificationModel = require("../../model/NotificationModel")
const router = express.Router()


router.post("/", async (req, res) => {
    if (!req.body.content || !req.body.chatId) {
        return res.sendStatus(400)
    }

    const newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    }

    try {
        let results = await MessageModel.create(newMessage)
        results = await MessageModel.populate(results, { path: "sender" })
        results = await ChatModel.populate(results, { path: "chat" })
        results = await ChatModel.populate(results, { path: "chat.users" })

        const chat = await ChatModel.findByIdAndUpdate(req.body.chatId, { latestMessage: results })
        insertNotification(chat, results)
        res.status(201).send(results)

    } catch (err) {
        res.sendStatus(400)
    }
})


function insertNotification(chat, message) {
    chat.users.forEach(async userId => {
        if (userId == message.sender._id.toString()) return

        await NotificationModel.insertNotification(userId, message.sender._id, "newMessage", message.chat._id)
    })
}

module.exports = router