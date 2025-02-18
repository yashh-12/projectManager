import mongoose, { Schema } from "mongoose"

const projectSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            minlength: 3,
            maxlength: 50,
        },
        deadline: {
            type: String,
        },
        documents: [
            {
                type: Object
            }
        ]
    },
    { timestamps: true }
)

const Project = mongoose.model("Project", projectSchema)

export default Project