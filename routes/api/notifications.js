const express = require("express")
const NotificationModel = require("../../model/NotificationModel")
const router = express.Router()


router.get("/", async (req, res) => {
    const searchObj = {
        userTo: req.session.user._id,
        notificationType: { $ne: "newMessage" }
    }

    if (req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
        searchObj.opened = false
    }

    NotificationModel.find(searchObj)
    .populate("userTo")
    .populate("userFrom")
    .sort("-createdAt")
    .then((results) => {
        res.status(200).send(results)
    })
    .catch(err => res.sendStatus(400))
})


router.get("/latest", async (req, res) => {

    NotificationModel.findOne({ userTo: req.session.user._id })
    .populate("userTo")
    .populate("userFrom")
    .sort("-createdAt")
    .then((results) => {
        res.status(200).send(results)
    })
    .catch(() => res.sendStatus(400))
})


router.put("/:id/markAsOpened", async (req, res) => {
    NotificationModel.findByIdAndUpdate(req.params.id, {
        opened: true
    })
    .then(() => {
        res.sendStatus(204)
    })
    .catch(() => res.sendStatus(400))
})


router.put("/markAsOpened", async (req, res) => {
    NotificationModel.updateMany({ userTo: req.session.user._id }, {
        opened: true
    })
    .then(() => {
        res.sendStatus(204)
    })
    .catch(() => res.sendStatus(400))
})


module.exports = router