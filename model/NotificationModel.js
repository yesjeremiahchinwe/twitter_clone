const mongoose = require("mongoose")
const Schema = mongoose.Schema

const notificationSchema = new mongoose.Schema({
    userTo: { type: Schema.Types.ObjectId, ref: "User" },
    userFrom: { type: Schema.Types.ObjectId, ref: "User" },
    notificationType: String,
    opened: { type: Boolean, default: false },
    entityId: Schema.Types.ObjectId

}, { timestamps: true })


notificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId) => {
    const data = {
        userTo,
        userFrom,
        notificationType,
        entityId
    }

    await NotificationModel.deleteOne(data).catch(err => console.log(err))
    return NotificationModel.create(data).catch(err => console.log(err))
}



const NotificationModel = mongoose.model("Notification", notificationSchema)

module.exports = NotificationModel