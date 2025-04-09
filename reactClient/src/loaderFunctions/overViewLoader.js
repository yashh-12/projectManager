import { getAllTasks, getProjectOverview } from "../services/projectService";

const overViewLoader = async (req) => {
    try {
        const {projectId} = req.params;
        const overviewData = await getProjectOverview(projectId);
        const allTasks = await getAllTasks(projectId)
        return {overviewData,allTasks};
    } catch (error) {
        console.log(error);
        
    }
}

export default overViewLoader;