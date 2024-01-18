const express = require("express")
const router = express.Router()
const path = require("path")


router.get("/images/:path", (req, res) => {
    const image = req.params.path
    res.sendFile(path.join(__dirname, `../uploads/images/${image}`))
})


module.exports = router