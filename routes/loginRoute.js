const express = require("express")
const UserModel = require("../model/UserModel")
const router = express.Router()
const bcrypt = require("bcrypt")

router.get("/", (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect("/")
    }

    res.render("login")
})


router.post("/", async (req, res) => {
    const { usernameOrEmail, password } = req.body

    const payload = {
        errorMessage: "",
        inValidPassword: ""
    }

    const foundUser = await UserModel.findOne({
        $or: [
            { username: usernameOrEmail },
            { email: usernameOrEmail }
        ]
    })

    if (!foundUser) {
        payload.errorMessage = `Invalid username or email`
        return res.render("login", payload)
    }

    try {
        const comparedPassword = await bcrypt.compare(password, foundUser.password)
        if (comparedPassword) {
            req.session.user = foundUser
            return res.redirect("/")
        }
       
        payload.inValidPassword = "Invalid password"
        return res.render("login", payload)
    
    } catch (err) {
        console.error(err)
    }

})

module.exports = router