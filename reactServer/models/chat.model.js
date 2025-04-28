import { mongoose,Schema } from "mongoose";
import { FaS } from "react-icons/fa6";

const ChatSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    isGroupchat:{
        type: Boolean,
        default: false
    },
    projectId : {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    status:{
        type:String,
        enum:["read","unread"],
        default:"unread"
    }
    
},{timestamps: true})

const Chat = mongoose.model("Chat", ChatSchema)

export default Chat