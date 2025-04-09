import asyncHandler from "../utils/asyncHandler.js";
import Project from "../models/project.model.js"; // Make sure this is imported

const isOwner = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ success: false, message: "Project ID is required" });
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Unauthorized: Not the project owner" });
  }

  next();
});

export default isOwner;
