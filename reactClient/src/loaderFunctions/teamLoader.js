import { getAllTasks, getAllTeams ,getProjectMetaData} from "../services/projectService.js"

const teamLoader = async (req) => {
    const { projectId } = req.params;

    const aTeams = await getAllTeams(projectId);
    const projectData = await getProjectMetaData(projectId);

    return {aTeams,projectData};
}

export default teamLoader;