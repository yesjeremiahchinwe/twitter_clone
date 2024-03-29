const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
    const payload = createPayload(req.session.user)
    res.status(200).render("searchPage", payload)
})


router.get("/:selectedTab", (req, res) => {
    const payload = createPayload(req.session.user)
    payload.selectedTab = req.params.selectedTab
    res.status(200).render("searchPage", payload)
})


function createPayload(userLoggedIn) {
    return {
        pageTitle: "Search",
        userLoggedIn: userLoggedIn,
        userLoggedInJS: JSON.stringify(userLoggedIn)
    }
}

module.exports = router