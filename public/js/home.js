
$(document).ready(() => {
    $.get("/api/posts", { followingOnly: true }, postData => {
        outputPosts(postData, $(".postsContainer"))
    })
})
