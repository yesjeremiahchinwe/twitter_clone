const express = require("express")
const PostsModel = require("../../model/PostsModel")
const UserModel = require("../../model/UserModel")
const router = express.Router()


router.get("/", async (req, res) => {
    const searchObj = req.query;

    if (searchObj.isReply !== undefined) {
        const isReply = searchObj.isReply == "true";
        searchObj.replyTo = { $exists: isReply };
        delete searchObj.isReply;
    }

    if (searchObj.search !== undefined) {
        searchObj.content = { $regex: searchObj.search, $options: "i" }
        delete searchObj.search;
    }

    if (searchObj.followingOnly !== undefined) {
        const followingOnly = searchObj.followingOnly == "true";

        if (followingOnly) {
            const objectIds = []

            if (!req.session.user.following) {
                req.session.user.following = []
            }

            req.session.user.following.forEach(user => {
                objectIds.push(user)
            })

            objectIds.push(req.session.user._id);
            searchObj.postedBy = { $in: objectIds };
        }

        delete searchObj.followingOnly;
    }

    const results = await getPosts(searchObj);
    res.status(200).send(results);
})


router.get("/:id", async (req, res) => {
    const postId = req.params.id

    let postData = await getPosts({ _id: postId })
    postData = postData[0];

    let results = {
        postData: postData
    }

    if (postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo;
    }

    results.replies = await getPosts({ replyTo: postId });
    res.status(200).send(results);
})


router.post("/", async (req, res) => {

    if (!req.body.content) {
        return res.sendStatus(400);
    }

    let postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

    PostsModel.create(postData)
        .then(async newPost => {
            newPost = await UserModel.populate(newPost, { path: "postedBy" })

            res.status(201).send(newPost);
        })
        .catch(error => {
            res.sendStatus(400);
        })
})


router.put("/:id/like", async (req, res) => {
    const postId = req.params.id
    const userId = req.session.user._id

    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId)

    const option = isLiked ? "$pull" : "$addToSet";

    try {
        const userLikedPost = await UserModel.findByIdAndUpdate(userId, {
            [option]: { likes: postId }
        }, { new: true })

        const likedPost = await PostsModel.findByIdAndUpdate(postId, {
            [option]: { likes: userId }
        }, { new: true })

        req.session.user = userLikedPost
        return res.status(200).send(likedPost)
    } catch (err) {
        return res.status(400).send("Something went wrong")
    }
})


router.post("/:id/retweet", async (req, res) => {
    const postId = req.params.id
    const userId = req.session.user._id

    const deletedPost = await PostsModel.findOneAndDelete({ postedBy: userId, retweetData: postId })

    const option = deletedPost != null ? "$pull" : "$addToSet";

    let repost = deletedPost

    try {
        if (repost == null) {
            repost = await PostsModel.create({
                postedBy: userId,
                retweetData: postId
            })
        }

        const userRetweetPost = await UserModel.findByIdAndUpdate(userId, {
            [option]: { retweets: repost._id }
        }, { new: true })

        const post = await PostsModel
            .findByIdAndUpdate(postId, {
                [option]: { retweetUsers: userId }
            }, { new: true })

        req.session.user = userRetweetPost
        return res.status(201).send(post)

    } catch (err) {
        return res.status(400).send(err.message)
    }
})


router.delete("/:id", async (req, res) => {
    const postId = req.params.id

    if (!postId) return res.status(404).send(`No post with the given Id ${postId}`)

    try {
        const deletedPost = await PostsModel.findByIdAndDelete(postId)
        res.status(202).send(deletedPost)
    } catch (err) {
        res.status(500).send("Something went wrong")
    }
})


router.put("/:id", async (req, res) => {
    const postId = req.params.id
    if (!postId) return res.status(404).send(`No post with the given Id ${postId}`)

    if (req.body.pinned !== undefined) {
        await PostsModel.updateMany({ postedBy: req.session.user }, {
            pinned: false
        })
            .catch(err => {
                return res.sendStatus(400)
            })
    }

    try {
        await PostsModel.findByIdAndUpdate(postId, req.body)
        res.sendStatus(204)
    } catch (err) {
        res.sendStatus(400)
    }
})


async function getPosts(filter) {
    let results = await PostsModel
        .find(filter)
        .populate("postedBy")
        .populate("retweetData")
        .populate("replyTo")
        .sort("-createdAt")
        .catch(err => err.message)

    results = await UserModel.populate(results, { path: "replyTo.postedBy" })
    return await UserModel.populate(results, { path: "retweetData.postedBy" })
}


module.exports = router