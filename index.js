require("express-async-errors")
require("dotenv").config()
const express = require("express")
const app = express()
const path = require("path")
const mongoose = require("mongoose")
const connectDB = require("./config/dbConnection")
const session = require("express-session")
const bodyParser = require("body-parser")
const auth = require("./middleware/auth")


connectDB()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, "public")))
app.use(session({
    secret: "jerryman",
    resave: true,
    saveUninitialized: false
}))

app.set("view engine", "pug")
app.set("views", "views")



app.use("/login", require("./routes/loginRoute"))
app.use("/register", require("./routes/registerRoute"))

app.use(auth)

app.use("/", require("./routes/homeRoute"))
app.use("/logout",  require("./routes/logoutRoute"))
app.use("/api/posts", require("./routes/api/posts"))
app.use("/posts", require("./routes/postRoute"))
app.use("/profile", require("./routes/profileRoute"))
app.use("/api/users", require("./routes/api/users"))
app.use("/uploads", require("./routes/uploadRoute"))
app.use("/search", require("./routes/searchRoute"))
app.use("/messages", require("./routes/messagesRoute"))
app.use("/api/chats", require("./routes/api/chats"))
app.use("/api/messages", require("./routes/api/messages"))

mongoose.connection.once("open", () => {
    console.log("Connected to mongodb...")
    app.listen(3500, () => {
        console.log("Listening on port 3500...")
    })
})