$(document).ready(() => {
    $.get("/api/chats", (data, status, xhr) => {
        if (xhr.status == 400) {
            alert("Could not get chat list")
        } else {
            outPutChatList(data, $(".resultsContainer"))
        }
    })
})


function outPutChatList(chatList, container) {
    chatList.forEach(chat => {
        const html = createChatHtml(chat)
        container.append(html)
    })

    if (chatList.length == 0) {
        container.append(`<span class="noResults">No results found</span>`)
    }
}


function createChatHtml(chatData) {
    const chatName = getChatName(chatData)
    const image = getChatImageElement(chatData)
    const latestMessage = getLatestMessage(chatData.latestMessage)

    return `<a href="/messages/${chatData._id}" class="resultListItems">
            <div class="resultsImageContainer">
                ${image}
            </div>
            
            <div class="resultDetailContainer ellipsis">
                <span class="heading ellipsis">${chatName}</span>
                <span class="subText ellipsis">${latestMessage}</span>
            </div>
    </a>`
}


function getLatestMessage(latestMessage) {
    if (latestMessage != null) {
        const sender = latestMessage.sender
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`
    }

    return "New chat"
}


function getChatImageElement(chatData) {
    const otherChatUsers = getOtherChatUsers(chatData.users)
    let groupChatClass = ""
    let chatImage = getUserChatImageElement(otherChatUsers[0])

    if (otherChatUsers.length > 1) {
        groupChatClass = "groupChatImage"
        chatImage += getUserChatImageElement(otherChatUsers[1])
    }

    return `<div class="resultsImageContainer ${groupChatClass}">${chatImage}</div>`
}


function getUserChatImageElement(user) {
    if (!user || !user.profilePic) {
        return alert("User passed into function is invalid")
    }

    return `<img src="${user.profilePic}" alt="User profile pic" />`
}