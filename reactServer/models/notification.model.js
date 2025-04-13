import mongoose,{Schema} from "mongoose";

const notificationSchema = new Schema({
    userId : {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true
    },
    message:{
        type: String,
        required:true
    },
    status:{
        type:String,
        enum:["read","unread"],
        default:"unread",
    }
})

const Notification = mongoose.model("Notification",notificationSchema)

export default Notification