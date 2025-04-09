import { mongoose,Schema } from "mongoose";

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
    
},{timestamps: true})

const Chat = mongoose.model("Chat", ChatSchema)

export default Chat