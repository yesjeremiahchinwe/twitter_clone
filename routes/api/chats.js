const express = require("express")
const ChatModel = require("../../model/ChatModel")
const UserModel = require("../../model/UserModel")
const MessageModel = require("../../model/MessageModel")
const router = express.Router()


router.get("/", async (req, res) => {
    ChatModel
        .find({ users: { $elemMatch: { $eq: req.session.user._id } } })
        .populate("users")
        .populate("latestMessage")
        .sort("-updatedAt")
        .then(async results => {

            if (req.query.unreadOnly !== undefined && req.query.unreadOnly == true) {
                results = results.filter(message => !message.latestMessage.readBy.includes(req.session.user._id))
            }


            results = await UserModel.populate(results, { path: "latestMessage.sender" })
            res.status(200).send(results)
        })
        .catch(err => {
            res.sendStatus(400)
        })
})


router.get("/:chatId", async (req, res) => {
    ChatModel
        .findOne({ _id: req.params.chatId, users: { $elemMatch: { $eq: req.session.user._id } } })
        .populate("users")
        .then((data) => res.status(200).send(data))
        .catch(err => {
            res.sendStatus(400)
        })
})


router.get("/:chatId/messages", async (req, res) => {
    MessageModel
        .find({ chat: req.params.chatId })
        .populate("sender")
        .then((data) => res.status(200).send(data))
        .catch(err => {
            res.sendStatus(400)
        })
})


router.put("/:chatId", async (req, res) => {
    ChatModel
        .findByIdAndUpdate(req.params.chatId, req.body)
        .then(() => res.sendStatus(204))
        .catch(err => {
            res.sendStatus(400)
        })
})


router.post("/", async (req, res) => {
    if (!req.body.users) {
        return res.sendStatus(400)
    }

    const users = JSON.parse(req.body.users)

    if (users.length == 0) {
        return res.sendStatus(400)
    }

    users.push(req.session.user)

    ChatModel.create({
        users,
        isGroupChat: true
    })
        .then(results => res.status(201).send(results))
        .catch(err => {
            res.sendStatus(400)
        })
})


module.exports = router