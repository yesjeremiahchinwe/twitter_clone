const express = require("express")
const bcrypt = require("bcrypt")
const UserModel = require("../model/UserModel")
const router = express.Router()

router.get("/", (req, res) => {
    if (req.session.user) return res.redirect("/")
    res.render("register")
})

router.post("/", async (req, res) => {
    const payload = req.body
    const { firstName, lastName, username, email, password } = req.body

    const foundUser = await UserModel.findOne({
        $or: [{ username }, { email }]
    })

    if (foundUser) {
        return res.status(409).send("Username or email already in use!")
    }

    if (firstName && lastName && username && email && password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        try {
            const newUser = await UserModel.create({
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
            })
            req.session.user = newUser
            return res.redirect("/")
        } catch (err) {
            console.error(err)
        }
    }

    payload.errorMessage = "Make sure each field has a valid value!"
    res.render("register")
})

module.exports = router