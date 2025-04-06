import { getAllTasks, getAllTeams } from "../services/projectService.js"

const teamLoader = async(req) => {
    const { projectId } = req.params;

    const res = await getAllTeams(projectId);
    return res;
}

export default teamLoader;