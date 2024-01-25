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

const server = app.listen(3500, () => {
    console.log("Listening on port 3500...")
})

const io = require("socket.io")(server, { pingTimeout: 60000 })

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
app.use("/notifications", require("./routes/notificationsRoute"))
app.use("/api/notifications", require("./routes/api/notifications"))


mongoose.connection.once("open", () => {
    console.log("Connected to mongodb...")
})


io.on("connection", socket => {
    
    socket.on("setup", userData => {
        socket.join(userData._id)
        socket.emit("connected")
    })

    socket.on("join room", (room) => {
        socket.join(room)
    })

    socket.on("typing", (chatId) => {
        socket.in(chatId).emit("typing")
    })

    socket.on("stop typing", (chatId) => {
        socket.in(chatId).emit("stop typing")
    })

    socket.on("notification received", (userId) => {
        socket.in(userId).emit("notification received")
    })


    socket.on("new message", newMessage => {
        const chat = newMessage.chat

        if (!chat.users?.length) return console.log("Chat.users not defined")

        chat.users.forEach(user => {
            if (user._id == newMessage.sender._id) return

            socket.in(user._id).emit("message received", newMessage)
        })
    })
})