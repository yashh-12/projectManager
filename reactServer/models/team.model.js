import mongoose, { Schema } from "mongoose"

const teamSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project"
        }
    },
    { timestamps: true }
)

const Team = mongoose.model("Team", teamSchema)

export default Team