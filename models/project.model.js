import mongoose, {Schema} from "mongoose"

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
    }
)

const Project = mongoose.model("Project", projectSchema)

export default Project