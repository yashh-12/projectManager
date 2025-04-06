import mongoose, { Schema } from "mongoose";

const preferenceSchema = new Schema(
    {
        theme: {
            type: String,
            trim: true,
            default: "light",
        }
    }
)

const Preference = mongoose.model("Preference", preferenceSchema)

export default Preference