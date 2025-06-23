import { getAllTasks, getProjectMetaData, getProjectOverview } from "../services/projectService";

const overViewLoader = async (req) => {
    try {
        const {projectId} = req.params;
        console.log("this ran");
        
        const overviewData = await getProjectOverview(projectId);
        const allTasks = await getAllTasks(projectId)
                console.log("this ran ");

        const projectData = await getProjectMetaData(projectId);
        console.log("this ran ");
        
        return {overviewData,allTasks,projectData};
    } catch (error) {
        console.log(error);
        
    }
}

export default overViewLoader;