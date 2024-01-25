
$(document).ready(() => {
    $.get("/api/posts", { followingOnly: true }, postData => {
        outputPosts(postData, $(".postsContainer"))

        $(".homePageLoading").remove()
        $(".postsContainer").css("visibility", "visible")
    })
})
