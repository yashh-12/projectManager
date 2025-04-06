import mongoose, { Schema } from "mongoose";

const preferenceSchema = new Schema(
    {
        theme: {
            type: String,
            trim: true,
            default: "light",

        },
        verificationCode: {
            type: Number,
            default: null
        }
    }
)

const Preference = mongoose.model("Preference", preferenceSchema)

export default Preference