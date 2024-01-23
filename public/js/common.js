let cropper;
let timer;
let selectedUsers = []

$(document).ready(() => {
    refreshMessagesBadge()
    refreshNotificationsBadge()
})


$("#submitPostButton").prop("disabled", true);

$("#postTextarea, #replyTextarea").keyup(event => {
    const textbox = $(event.target);
    const value = textbox.val().trim();

    const isModal = textbox.parents(".modal").length == 1;

    const submitPostButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if (submitPostButton.length == 0) return alert("No submit button found");

    if (value == "") return submitPostButton.prop("disabled", true)

    submitPostButton.prop("disabled", false)
})


/* ------------------ Notification ----------------- */
$(document).on("click", ".notification.active", (e) => {
    const container = $(e.target)
    const notificationId = container.data().id

    const href = container.attr("href")
    e.preventDefault()

    const callback = () => window.location = href
    markNotificationAsOpened(notificationId, callback)
})


// ----------------- Chat Search Box -------------------
$("#userSearchTextBox").keydown((event) => {
    clearTimeout(timer)

    const textBox = $(event.target);
    let value = textBox.val()

    if (value == "" && (event.which == 0 || event.keyCode == 8)) {
        selectedUsers.pop()
        updateSelectedUserHtml()
        $(".resultsContainer").html("")

        if (selectedUsers.length == 0) {
            $("#createChatButton").prop("disabled", true)
        }

        return;
    }

    timer = setTimeout(() => {
        value = textBox.val().trim();

        if (value == "") {
            $(".resultsContainer").html("");
        } else {
            searchUsers(value)
        }
    }, 1000)
})


/* --------------------- Chat route -------------------- */
$("#createChatButton").click(function () {
    const data = JSON.stringify(selectedUsers)

    $.post("/api/chats", { users: data }, chat => {

        if (!chat || !chat._id) return alert("Invalid response from server!")
        window.location.href = `/messages/${chat._id}`
    })
})


$("#submitPostButton, #submitReplyButton").click((event) => {
    const button = $(event.target);

    const isModal = button.parents(".modal").length == 1;

    const textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

    const data = {
        content: textbox.val()
    }

    if (isModal) {
        let id = button.data().id;
        if (id == null) return alert("Button id is null");
        data.replyTo = id;
    }

    $.post("/api/posts", data, postData => {
        // if (isModal) return location.reload()
        if (postData.replyTo) {
            location.reload();
        }

        const html = createPostHtml(postData);
        $(".postsContainer").prepend(html);
        textbox.val("");
        button.prop("disabled", true)
    })
})


// --------------------- Reply Button -----------------------
$(document).on("click", ".comment", (event) => {
    $("#replyModal").modal("show")

    const button = $(event.target)
    const postId = getPostIdFromElement(button)
    $("#submitReplyButton").data("id", postId);

    $.get(`/api/posts/${postId}`, (results) => {
        outputPosts(results.postData, $("#originalPostContainer"));
    })
})


// --------------------- Follow Button -----------------------
$(document).on("click", ".followButton", (event) => {

    const button = $(event.target)
    const userId = button.data().user

    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => {
            if (xhr.status == 400) return

            let difference = 1;

            if (data.following && data.following.includes(userId)) {
                button.addClass("following");
                button.text("Following");
            }
            else {
                button.removeClass("following");
                button.text("Follow");
                difference = -1;
            }

            const followersLabel = $("#followersValue");

            if (followersLabel.length != 0) {
                let followersText = followersLabel.text();
                followersText = parseInt(followersText);
                followersLabel.text(followersText + difference);
            }
        }
    })
})


// ------------------ Delete Button -----------------
$(document).on("click", ".delete", (event) => {
    $("#deletePostModal").modal("show")

    const button = $(event.target)
    const postId = getPostIdFromElement(button)
    $("#deletePostButton").data("id", postId);
})


$("#deletePostButton").click(function () {
    const id = $(this).data("id");

    $.ajax({
        url: `/api/posts/${id}`,
        type: "DELETE",
        success: () => {
            location.reload()
        }
    })
})


// ------------------ Pin Button -----------------
$(document).on("click", ".pinPost", (event) => {
    $("#confirmPinModal").modal("show")

    const button = $(event.target)
    const postId = getPostIdFromElement(button)
    $("#pinPostButton").data("id", postId);
})


$("#pinPostButton").click(function () {
    const id = $(this).data("id");

    $.ajax({
        url: `/api/posts/${id}`,
        type: "PUT",
        data: { pinned: true },
        success: (data, status, xhr) => {

            if (xhr.status != 204) {
                alert("Could not pin this post")
                return;
            }

            location.reload()
        }
    })
})


// -------------- Unpin Post ----------------
$(document).on("click", ".unPinPost", (event) => {
    // $("#confirmPinModal").modal("hide")
    $("#unpinModal").modal("show")

    const button = $(event.target)
    const postId = getPostIdFromElement(button)
    $("#unpinPostButton").data("id", postId);
})

$("#unpinPostButton").click(function () {
    const id = $(this).data("id");

    $.ajax({
        url: `/api/posts/${id}`,
        type: "PUT",
        data: { pinned: false },
        success: (data, status, xhr) => {

            if (xhr.status != 204) {
                alert("Could not pin this post")
                return;
            }

            location.reload()
        }
    })
})


// ------------------- Profile Image Upload ------------------
$(document).on("click", ".upload", () => {
    $("#imageUploadModal").modal("show")
})


$("#filePhoto").change(function () {
    if (this.files && this.files[0]) {
        const reader = new FileReader();

        reader.onload = (event) => {
            let image = document.querySelector("#imagePreview")
            image.src = event.target.result

            if (cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false
            });
        }

        reader.readAsDataURL(this.files[0])
    }
})


$("#imageUploadButton").click(() => {
    const canvas = cropper.getCroppedCanvas();

    if (canvas == null) {
        alert("Could not upload image. Make sure it's an image file!")
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/profilePicture",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        })
    })
})


// ---------- Cover Photo Upload -----------
$(document).on("click", ".uploadCoverPhoto", () => {
    $("#coverPhotoModal").modal("show")
})


$("#coverPhoto").change(function () {
    if (this.files && this.files[0]) {
        const reader = new FileReader();

        reader.onload = (event) => {
            let image = document.querySelector("#coverPreview")
            image.src = event.target.result

            if (cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false
            });
        }

        reader.readAsDataURL(this.files[0])
    }
})

$("#coverPhotoUploadButton").click(() => {
    const canvas = cropper.getCroppedCanvas();

    if (canvas == null) {
        alert("Could not upload image. Make sure it's an image file!")
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/coverPhoto",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        })
    })
})

// -------- Clear reply input value on modal close ---------
$("#replyModal").on("hidden.bs.modal", () => $("#replyTextarea").val(""))


// ------------------ Like Button -----------------
$(document).on("click", ".likeButton", (event) => {
    const button = $(event.target)
    const span = button.find("span")
    const postId = getPostIdFromElement(button)

    if (!postId) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            span.text(postData.likes.length || "")
            if (postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active")
            } else {
                button.removeClass("active")
            }
        }
    })
})

// ----------------- Retweet button --------------------
$(document).on("click", ".retweet", (event) => {
    const button = $(event.target)
    const span = button.find("span")
    const postId = getPostIdFromElement(button)

    if (!postId) return;

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            span.text(postData.retweetUsers.length || "")
            if (postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active")
            } else {
                button.removeClass("active")
            }
        }
    })
})

// ------------------- Send User to Post Page ------------------
$(document).on("click", ".post", (event) => {
    const element = $(event.target)
    const postId = getPostIdFromElement(element)

    if (postId !== undefined && !element.is("button")) {
        window.location.href = `/posts/${postId}`
    }
})

function getPostIdFromElement(element) {
    const isRoot = element.hasClass("post");
    const rootElement = isRoot === true ? element : element.closest(".post")
    const postId = rootElement.data().id;

    if (postId === undefined) return alert("Post if undefined!")

    return postId
}



function createPostHtml(postData, largeFont = false) {
    // const checkForALoggedInUser = JSON.parse(localStorage.getItem("userLoggedIn"))
    // let userLoggedIn = checkForALoggedInUser != undefined && JSON.parse(localStorage.getItem("userLoggedIn"))

    if (postData == null) return alert("Post object is null!");
    const isRetweet = postData.retweetData !== undefined;

    const retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;

    const postedBy = postData.postedBy;

    const displayName = `${postedBy.firstName} ${postedBy.lastName}`;

    const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    const likeButtonOnActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    const retweetButtonOnActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    const largeFontClass = largeFont ? "largefont" : "";

    let retweetText = ""
    if (isRetweet) {
        retweetText = `<span>
        <i class="fa-solid fa-retweet"></i>
        Retweeted by 
        <a href="/profile/${retweetedBy}">@${retweetedBy.toLowerCase()}</a>
        </span>`
    }

    let replyFlag = "";
    if (postData.replyTo && postData.replyTo._id) {

        let replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername.toLowerCase()}<a>
                    </div>`
    }


    let buttons = "";
    let pinnedPostText = ""
    if (postData.postedBy._id == userLoggedIn._id) {

        let pinnedClass = ""
        let dataTarget = "#confirmPinModal"
        let pinClass = "pinPost"

        if (postData.pinned === true) {
            pinnedClass = "active"
            dataTarget = "#unpinModal"
            pinClass = "unPinPost"

            pinnedPostText = `<i class="fa-solid fa-thumbtack">
                <span>Pinned post</span>
           </i>`
        }

        buttons = `<button data-id="${postData._id}" data-toggle"modal" data-target="#deletePostModal" class="delete">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <button data-id="${postData._id}" data-toggle"modal" data-target="${dataTarget}" class="${pinClass} pin ${pinnedClass}">
            <i class="fa-solid fa-thumbtack"></i>
        </button>`
    }


    return `<div class="post ${largeFontClass}" data-id='${postData._id}'>
                <div class="postActionContainer">
                    ${retweetText}
                </div>

                <div class="mainContentContainer">
                    <div class="userImageContainer">
                        <img src='${postedBy.profilePic.trim()}' alt="User profile"/>
                    </div>

                    <div class="postContentContainer">
                    <div class="pinnedPostText">${pinnedPostText}</div>
                        <div class="postHeader">
                            <a href="/profile/${postedBy.username}" class="displayname">${displayName}</a>
                            <span class="username">@${postedBy.username}</span>
                            <span class="date">${timestamp}</span>
                            <div class="buttons">
                                ${buttons}
                            </div>
                        </div>
                        ${replyFlag}
                        <div class="postBody">
                            <span>${postData.content}</span>
                        </div>
                        <div class="postFooter">
                            <div class="postButtonContainer">
                                <button data-toggle='modal' data-target='#replyModal' class="comment">
                                    <i class="fa-regular fa-comment"></i>
                                </button>
                            </div>

                            <div class="postButtonContainer green">
                                <button class="retweet ${retweetButtonOnActiveClass}">
                                    <i class="fa-solid fa-retweet"></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>

                            <div class="postButtonContainer red">
                                <button class="likeButton ${likeButtonOnActiveClass}">
                                    <i class="fa-regular fa-heart"></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
}

function timeDifference(current, previous) {

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 5) return "Just now";
        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function outputPosts(results, container) {
    container.html("");

    if (!Array.isArray(results)) {
        results = [results];
    }

    results.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });
}


function outputPostsWithReplies(results, container) {
    container.html("");

    if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
        const html = createPostHtml(results.replyTo)
        container.append(html);
    }

    const mainPostHtml = createPostHtml(results.postData, true)
    container.append(mainPostHtml);

    results.replies.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });
}


function outputUsers(data, container) {
    container.html("");

    if (data.length == 1) {
        const html = createUserHtml(data, true)
        container.append(html)
    } else {
        data.forEach(result => {
            const html = createUserHtml(result, true)
            container.append(html)
        })
    }
   

    if (data.length == 0) {
        container.append(`<span class="noResult">No results found!</span>`)
    }
}


function createUserHtml(userData, showFollowButton) {
    var name = userData.firstName + " " + userData.lastName
    const checkForALoggedInUser = JSON.parse(localStorage.getItem("userLoggedIn"))
    let userLoggedIn = checkForALoggedInUser != undefined && JSON.parse(localStorage.getItem("userLoggedIn"))
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id)
    var text = isFollowing ? "following" : "follow"
    var buttonClass = isFollowing ? "followButton following" : "followButton"

    var followBtn = ""
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followBtn = `<div class="followButtonContainer">
            <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
        </div>
        `
    }


    return `<div class="user">
        <div class="userImageContainer">
            <img src="${userData.profilePic}" alt="User profile pic" />
        </div>

        <div class="userDetailsContainer">
            <div class="header">
                <a href='/profile/${userData.username}'>${name}</a>
                <span class="username">@${userData.username}</span>
            </div>
        </div>

        ${followBtn}
    </div>`
}


function searchUsers(searchText) {
    $.get("/api/users", { search: searchText }, results => {
        outputSelectableUsers(results, $(".resultsContainer"))
    })
}

function outputSelectableUsers(data, container) {
    container.html("");

    data.forEach(user => {

        if (user._id == userLoggedIn._id || selectedUsers.some(u => u._id == user._id)) {
            return;
        }

        const html = createUserHtml(user, false)
        const element = $(html)
        element.click(() => userSelected(user))
        container.append(element)
    })

    if (data.length == 0) {
        container.append(`<span class="noResult">No results found!</span>`)
    }
}


function userSelected(userData) {
    selectedUsers.push(userData)
    updateSelectedUserHtml()

    $("#userSearchTextBox").val("").focus()
    $(".resultsContainer").html("")
    $("#createChatButton").prop("disabled", false)
}


function updateSelectedUserHtml() {
    const elements = []

    selectedUsers.forEach((user) => {
        const userFullName = `${user.firstName} ${user.lastName}`
        const userElement = $(`<span class="selectedUser">${userFullName}</span>`)
        elements.push(userElement)
    })

    $(".selectedUser").remove()
    $("#selectedUsers").prepend(elements)
}

function getChatName(chatData) {
    let chatName = chatData.chatName;

    if (!chatName) {
        const otherChatUsers = getOtherChatUsers(chatData.users);
        const namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
        chatName = namesArray.join(", ")
    }

    return chatName;
}


function getOtherChatUsers(users) {
    if (users.length == 1) return users

    return users.filter(user => user._id != userLoggedIn._id)
}


function messageReceived(newMessage) {
    if ($(".chatContainer").length == 0) {
        // Show pop notification
    } else {
        addChatMessageHtml(newMessage)
    }

    refreshMessagesBadge()
}


function markNotificationAsOpened(notificationId = null, callback = null) {
    if (callback == null) {
        callback = () => location.reload()
    }

    const url = notificationId != null ? 
    `/api/notifications/${notificationId}/markAsOpened` :
    `/api/notifications/markAsOpened`

    $.ajax({
        url,
        type: "PUT",
        success: callback
    })
}


function refreshMessagesBadge() {
    $.get("/api/chats", { unreadOnly: true }, data => {

        const newResults = data.length
        if (newResults > 0) {
            $("#messagesBadge").text(newResults).addClass("active")
        } else {
            $("#messagesBadge").text("").removeClass("active")
        }
    })
}


function refreshNotificationsBadge() {
    $.get("/api/notifications", { unreadOnly: true }, data => {

        const newResults = data.length

        if (newResults > 0) {
            $("#notificationBadge").text(newResults).addClass("active")
        } else {
            $("#notificationBadge").text("").removeClass("active")
        }
    })
}