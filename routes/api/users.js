const express = require("express")
const multer = require("multer")
const upload = multer({ dest: "uploads/" })
const PostsModel = require("../../model/PostsModel")
const UserModel = require("../../model/UserModel")
const router = express.Router()
const path = require("path")
const fs = require("fs")


router.get("/", (req, res) => {
    let searchObj = req.query

    if (req.query.search !== undefined) {
        searchObj = {
            $or: [
                { firstName: { $regex: req.query.search, $options: "i" } },
                { lastName: { $regex: req.query.search, $options: "i" } },
                { username: { $regex: req.query.search, $options: "i" } },
            ]
        }
    }

    UserModel.find(searchObj)
    .then(results => res.status(200).send(results))
    .catch(err => {
        res.sendStatus(400)
    })

});

router.put("/:userId/follow", async (req, res) => {
    const userId = req.params.userId;

    const user = await UserModel.findById(userId);

    if (user === null) return res.sendStatus(404);

    const isFollowing = user.followers && user.followers.includes(req.session.user._id);
    const option = isFollowing ? "$pull" : "$addToSet";

    req.session.user = await UserModel.findByIdAndUpdate(req.session.user._id, { [option]: { following: userId } }, { new: true })
        .catch(error => {
            res.sendStatus(400);
        })

    UserModel.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } })
        .catch(error => {
            res.sendStatus(400);
        })

    res.status(200).send(req.session.user);
})


router.get("/:userId/following", async (req, res) => {
    UserModel
    .findById(req.params.userId)
    .populate("following")
    .then(results => {
        res.status(200).send(results)
    })
    .catch(err => {
        res.sendStatus(400)
    })
})


router.get("/:userId/followers", async (req, res) => {
    UserModel
    .findById(req.params.userId)
    .populate("followers")
    .then(results => {
        res.status(200).send(results)
    })
    .catch(err => {
        res.sendStatus(400)
    })
})


router.post("/profilePicture", upload.single("croppedImage"), async (req, res) => {
    
    if (!req.file) {
        return res.status(400).send("No file uploaded with ajax request")
    }

    let filePath = `/uploads/images/${req.file.filename}.png`;
    let tempPath = req.file.path
    let targetPath = path.join(__dirname, `../../${filePath}`)

    fs.rename(tempPath, targetPath, async (err) => {
        if (err != null) {
            return res.sendStatus(400);
        }

        req.session.user = await UserModel.findByIdAndUpdate(req.session.user._id, {
            profilePic: filePath
        }, { new: true })

        res.sendStatus(202)
    }) 
})


router.post("/coverPhoto", upload.single("croppedImage"), async (req, res) => {
    
    if (!req.file) {
        return res.status(400).send("No file uploaded with ajax request")
    }

    let filePath = `/uploads/images/${req.file.filename}.png`;
    let tempPath = req.file.path
    let targetPath = path.join(__dirname, `../../${filePath}`)

    fs.rename(tempPath, targetPath, async (err) => {
        if (err != null) {
            return res.sendStatus(400);
        }

        req.session.user = await UserModel.findByIdAndUpdate(req.session.user._id, {
            coverPhoto: filePath
        }, { new: true })

        res.sendStatus(202)
    }) 
})


module.exports = router