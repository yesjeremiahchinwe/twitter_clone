$(document).ready(() => {
    $.get("/api/notifications", (data) => {
        outNotificationList(data, $(".resultsContainer"))
    })
})


/* ------------------ Mark notifications as read ----------------- */
$("#markNotificationsAsRead").click(() => markNotificationAsOpened())

