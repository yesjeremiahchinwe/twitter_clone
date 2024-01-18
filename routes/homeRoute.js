const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")

router.get("/", auth, (req, res) => {
    const payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user)
    }
    res.render("home", payload)
})

module.exports = router