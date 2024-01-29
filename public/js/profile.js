$(document).ready(() => {

    if (selectedTab === "replies") {
        loadReplies()
        
    } else {
        loadPosts();
    }
    
})

function loadPosts() {
    $.get("/api/posts", { postedBy: profileUserId, pinned: true }, postData => {
        outPinnedPost(postData, $(".pinnedPostContainer"))

        $(".homePageLoading").remove()
        $(".postsContainer").css("visibility", "visible")
    })

    $.get("/api/posts", { postedBy: profileUserId, isReply: false }, postData => {
        outputPosts(postData, $(".postsContainer"))
    })
}


function loadReplies() {
    $.get("/api/posts", { postedBy: profileUserId, isReply: true }, postData => {
        outputPosts(postData, $(".postsContainer"))
    })
}

function outPinnedPost(results, container) {
    if (results.length == 0) {
        container.hide();
        return;
    }

    container.html("");

    results.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });
}