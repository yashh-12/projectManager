import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) return null;
    const response = await cloudinary.uploader.upload(localfilePath,{
        resource_type : "auto",
        folder: "ProjectManager"
    });
    fs.unlinkSync(localfilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localfilePath);
    return null;
  }
};

const deleteFromClodinary = async (public_id) => {
  try {
    if (!localfilePath) return null;
    const response = await cloudinary.uploader.destroy(public_id);
    return response;
  } catch (error) {
    return null;
  }
}

export {uploadonCloudinary,deleteFromClodinary}