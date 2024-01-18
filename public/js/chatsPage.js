$(document).ready(() => {
    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data))
    })

    $.get(`/api/chats/${chatId}/messages`, (data) => {

        const messages = []
        let lastSenderId = ""

        data.forEach((message, index) => {
            const html = createMessageHtml(message, data[index + 1], lastSenderId)
            messages.push(html)

            lastSenderId = message.sender._id
        })

        const messageHtml = messages.join("")
        addMessageHtmlToPage(messageHtml)
        scrollToBottom(false)

        $(".loadingSpinnerContainer").remove()
        $(".chatContainer").css("visibility", "visible")
    })
})


function addMessageHtmlToPage(html) {
    $(".chatMessages").append(html)
}


$("#chatNameButton").click(() => {
    const name = $("#chatNameTextbox").val().trim()

    $.ajax({
        url: `/api/chats/${chatId}`,
        type: "PUT",
        data: { chatName: name },
        success: (data, status, xhr) => {
            if (xhr.status != 204) {
                alert("Could not update")
            } else {
                location.reload();
            }
        }
    })
})


$(".sendMessageButton").click(() => {
    messageSubmitted()
})


$(".inputTextBox").keydown((event) => {

    if (event.which == 13 && !event.shiftKey) {
        messageSubmitted()
        return false
    }
})


function messageSubmitted() {
    const content = $(".inputTextBox").val().trim()

    if (content != "") {
        sendMesage(content)
        $(".inputTextBox").val("")
    }
}


function sendMesage(content) {
    $.post("/api/messages", { content, chatId }, (data, status, xhr) => {

        if (xhr.status != 201) {
            alert("Could not send message")
            $(".inputTextBox").val(content)
            return
        }
        
        addChatMessageHtml(data)
    })
}


function addChatMessageHtml(message) {
    if (!message || !message._id) {
        alert("Message is not valid!")
        return
    }

    const messageDiv = createMessageHtml(message, null, "")
    addMessageHtmlToPage(messageDiv)
    scrollToBottom(true)
}


function createMessageHtml(message, nextMessage, lastSenderId) {
    const sender = message.sender
    const senderName = sender.firstName + " " + sender.lastName
    const currentSenderId = sender._id
    const nextSenderId = nextMessage != null ? nextMessage.sender._id : ""
    const isFirst = lastSenderId != currentSenderId
    const isLast = nextSenderId != currentSenderId

    let isMine = message.sender._id == userLoggedIn._id
    let liClasss = isMine ? "mine" : "theirs"
    let nameElement = ""


    if (isFirst) {
        liClasss += " first"

        if (!isMine) {
            nameElement = `<span class="senderName">${senderName}</span>`
        }
    }


    let profileImage = ""
    if (isLast) {
        liClasss += " last"
        profileImage = `<img src="${sender.profilePic}" />`
    }

    let imageContainer = ""
    if (!isMine) {
        imageContainer = `<div class="imageContainer">
            ${profileImage}
        </div>`
    }


    return `
        <li class="message ${liClasss}">
            ${imageContainer}
            <div class="messageContainer">
                ${nameElement}
                <span class="messageBody">
                    ${message.content}
                </span>
            </div>
        </li>
    `
}


function scrollToBottom(animated) {
    const container = $(".chatMessages")
    const scrollHeight = container[0].scrollHeight

    if (animated) {
        container.animate({ scrollTo: scrollHeight }, "slow")
    } else {
        container.scrollTop(scrollHeight)
    }
}