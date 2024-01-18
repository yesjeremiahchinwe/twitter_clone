const express = require("express")
const router = express.Router()
const middleware = require("../middleware/auth")

router.get("/:id", middleware, (req, res) => {

    const payload = {
        pageTitle: "View post",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        postId: req.params.id
    }

    res.status(200).render("postPage", payload)
})

module.exports = router