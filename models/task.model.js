import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
    {
        task: {
            type: String,
            trim: true,
            required: true
        },
        details: {
            type: String,
            trim: true,
            required: true
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