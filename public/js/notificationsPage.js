$(document).ready(() => {
    $.get("/api/notifications", (data) => {
        outNotificationList(data, $(".resultsContainer"))
    })
})


/* ------------------ Mark notifications as read ----------------- */
$("#markNotificationsAsRead").click(() => markNotificationAsOpened())

function outNotificationList(notifications, container) {
    notifications.forEach(notification => {
        const html = createNotificationHtml(notification)
        container.append(html)
    })

    if (notifications.length == 0) {
        container.append(`<span class="noResults">No results found</span>`)
    }
}


function createNotificationHtml(notification) {
    const userFrom = notification.userFrom
    const text = getNotificationText(notification)
    const href = getNotificationURL(notification)
    const openClass = notification.opened ? "" : "active"

    return `<a href="${href}" class="resultListItems notification ${openClass}" data-id="${notification._id}">
        <div class="resultsImageContainer">
            <img src="${userFrom.profilePic}" alt="User profile pic" />
        </div>

        <div class="resultDetailContainer ellipsis">
        <span class="ellipsis">${text}</span>
    </div>
    </a>`
}

function getNotificationText(notification) {
    const userFrom = notification.userFrom

    if (!userFrom.firstName || !userFrom.lastName) {
        return alert("User from data not populated")
    }

    const userFromName = `${userFrom.firstName} ${userFrom.lastName}`
    let text

    if (notification.notificationType == "retweet") {
        text = `${userFromName} retweeted one of your posts`
    } else if (notification.notificationType == "postLike") {
        text = `${userFromName} retweeted one of your posts`
    } else if (notification.notificationType == "reply") {
        text = `${userFromName} replied one of your posts`
    } else if (notification.notificationType == "follow") {
        text = `${userFromName} followed you`
    }

    return `<span class="ellipsis">${text}</span>`

}


function getNotificationURL(notification) {
    let url = "#"

    if (
        notification.notificationType == "retweet" ||
        notification.notificationType == "postLike" ||
        notification.notificationType == "reply"
    ) {
        url = `/posts/${notification.entityId}`
    } else if (notification.notificationType == "follow") {
        url = `/profile/${notification.userFrom.username}`
    }

    return url

}