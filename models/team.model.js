import mongoose, { Schema } from "mongoose"

const teamSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        tasks: [
            {
                type: Schema.Types.ObjectId,
                ref: "Task"
            }
        ]
    },
    { timestamps: true }
)

const Team = mongoose.model("Team", teamSchema)

export default Team