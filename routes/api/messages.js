const express = require("express")
const ChatModel = require("../../model/ChatModel")
const MessageModel = require("../../model/MessageModel")
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

        ChatModel.findByIdAndUpdate(req.body.chatId, { latestMessage: results })
        
        res.status(201).send(results)

    } catch (err) {
        res.sendStatus(400)
    }
})


module.exports = router