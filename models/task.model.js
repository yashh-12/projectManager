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
            refs: "Project"
        },
        details: {
            type: String,
            trim: true,
            required: true
        },
        assign: {
            type: Schema.Types.ObjectId,
            refs: "Team"
        },
        deadline: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
)

const Task = mongoose.model("Task", taskSchema)

export default Task