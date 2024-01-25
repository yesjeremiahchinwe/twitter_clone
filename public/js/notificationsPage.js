$(document).ready(() => {
    $.get("/api/notifications", (data) => {
        outNotificationList(data, $(".resultsContainer"))

        $(".homePageLoading").remove()
        $(".resultsContainer").css("visibility", "visible")
    })
})


/* ------------------ Mark notifications as read ----------------- */
$("#markNotificationsAsRead").click(() => markNotificationAsOpened())

