const express = require("express")
const router = express.Router()


router.get("/", (req, res) => {
    const payload = {
        pageTitle: "Notifications",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user)
    }

    res.status(200).render("notificationsPage", payload)
})


module.exports = router