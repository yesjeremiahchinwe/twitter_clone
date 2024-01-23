let connected = false

const socket = io("http://localhost:3500")

socket.emit("setup", userLoggedIn)

socket.on("connected", () => connected = true)

socket.on("message received", newMessage => messageReceived(newMessage))

