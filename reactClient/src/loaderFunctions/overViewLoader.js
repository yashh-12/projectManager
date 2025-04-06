import { getProjectOverview } from "../services/projectService";

const overViewLoader = async (req) => {
    try {
        const {projectId} = req.params;
        const res = await getProjectOverview(projectId);
        console.log(res);
        
        return res;
    } catch (error) {
        console.log(error);
        
    }
}

export default overViewLoader;