import mongoose, {Schema} from "mongoose"

const organizationSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            refs: "User"
        },
        projects: [
            {
                type: Schema.Types.ObjectId,
                refs: "Project"
            }
        ]
    },
    {timestamp: true}
)

const Organization = mongoose.model("Organization", organizationSchema)

export default Organization