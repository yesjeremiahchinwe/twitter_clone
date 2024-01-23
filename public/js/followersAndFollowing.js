$(document).ready(() => {
    if (selectedTab === "followers") {
        loadFollowers();

    } else {
        loadFollowing();
    }
    
});


function loadFollowers() {
    $.get(`/api/users/${profileUserId}/followers`, postData => {
        outputUsers(postData.followers, $(".resultsContainer"))
    })
}


function loadFollowing() {
    $.get(`/api/users/${profileUserId}/following`, postData => {
        console.log(postData)
        outputUsers(postData.following, $(".resultsContainer"))
    })
}
