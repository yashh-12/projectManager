import mongoose, { Schema } from "mongoose";

const membershipSchema = new Schema(
    {
        member: {
            type: Schema.Types.ObjectId,
            refs: "User"
        },
        teamID: {
            type: Schema.Types.ObjectId,
            refs: "Team"
        }
    },
    { timestamps: true }
)

const TeamMembership = mongoose.model("TeamMembership", membershipSchema)

export default TeamMembership