import { useParams } from "react-router-dom";
import { getAllTasks } from "../services/projectService"

const taskLoader = async(req) => {
    const {projectId} = req.params;
    const res = await getAllTasks(projectId)
    return res;
}

export default taskLoader;