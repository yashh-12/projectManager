import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
    {
        task: {
            type: String,
            trim: true,
            required: true
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project"
        },
        status: {
            type: Boolean,
            default: false
        },
        details: {
            type: String,
            trim: true,
            required: true
        },
        assign: {
            type: Schema.Types.ObjectId,
            ref: "Team"
        },
        deadline: {
            type: Date,
            default: Date.now(),
            trim: true
        }
    },
    { timestamps: true }
)

const Task = mongoose.model("Task", taskSchema)

export default Task