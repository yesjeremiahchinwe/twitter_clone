
$(document).ready(() => {
    $.get("/api/posts/" + postId, results => {

        outputPostsWithReplies(results, $(".postsContainer"));

        $(".homePageLoading").remove()
        $(".postsContainer").css("visibility", "visible")
    })
})


