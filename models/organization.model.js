import mongoose, { Schema } from "mongoose"

const organizationSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamp: true }
)

const Organization = mongoose.model("Organization", organizationSchema)

export default Organization