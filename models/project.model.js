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
            default: ""
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        teams: [
            {
                type: Schema.Types.ObjectId,
                refs: "Team"
            }
        ],
        tasks: [
            {
                type: Schema.Types.ObjectId,
                refs: "Task"
            }
        ],
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