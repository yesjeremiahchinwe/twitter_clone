const express = require("express")
const router = express.Router()
const UserModel = require("../model/UserModel")
const MessageModel = require("../model/MessageModel")


router.get("/", async (req, res) => {

    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        profileUser: req.session.user,
    }

    res.status(200).render("profilePage", payload)
})

router.get("/:username", async (req, res) => {
    const user = await UserModel.findOne({ username: req.params.username })

    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        profileUser: user,
    }

    res.status(200).render("profilePage", payload)
})


router.get("/:username/replies", async (req, res) => {
    const user = await UserModel.findOne({ username: req.params.username })

    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        profileUser: user
    }

    payload.selectedTab = "replies"
    res.status(200).render("profilePage", payload)
})


router.get("/:username/following", async (req, res) => {
    const user = await UserModel.findOne({ username: req.params.username })

    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        profileUser: user
    }

    payload.selectedTab = "following"
    res.status(200).render("followersAndFollowing", payload)
})


router.get("/:username/followers", async (req, res) => {
    const user = await UserModel.findOne({ username: req.params.username })

    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        profileUser: user
    }

    payload.selectedTab = "followers"
    res.status(200).render("followersAndFollowing", payload)
})


module.exports = router