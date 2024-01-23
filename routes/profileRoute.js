const express = require("express")
const router = express.Router()
const UserModel = require("../model/UserModel")


router.get("/", (req, res) => {

    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        profileUser: req.session.user
    }

    res.status(200).render("profilePage", payload)
})

router.get("/:username", async (req, res) => {
    let user = await UserModel.findOne({ username: req.params.username })

    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        profileUser: user
    }

    // const payload = await getPayload(req.params.username, req.session.user)
    res.status(200).render("profilePage", payload)
})


router.get("/:username/replies", async (req, res) => {
    const payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = "replies"
    res.status(200).render("profilePage", payload)
})


router.get("/:username/following", async (req, res) => {
    const payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = "following"
    res.status(200).render("followersAndFollowing", payload)
})


router.get("/:username/followers", async (req, res) => {
    let payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = "followers"
    res.status(200).render("followersAndFollowing", payload)
})


async function getPayload(username, loggedInUSER) {
    let user = await UserModel.findOne({ username: username })

    if(user == null) {

        user = await UserModel.findById(username);

        if (user == null) {
            return {
                pageTitle: "User not found",
                userLoggedIn: loggedInUSER,
                userLoggedInJs: JSON.stringify(loggedInUSER)
            }
        }
    }

    return {
        pageTitle: user.username,
        userLoggedIn: loggedInUSER,
        userLoggedInJs: JSON.stringify(loggedInUSER),
        profileUser: user
    }
}

module.exports = router