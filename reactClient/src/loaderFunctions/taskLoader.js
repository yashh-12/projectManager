import { useParams } from "react-router-dom";
import { getAllTasks ,getProjectMetaData} from "../services/projectService"

const taskLoader = async (req) => {
    const { projectId } = req.params;
    const tasks = await getAllTasks(projectId)
    const projectData = await getProjectMetaData(projectId);

    return {tasks,projectData};
}

export default taskLoader;