import { getAllProjects } from "../services/projectService";

const dashboardLoader = async () => {
    try {
        const allProjects = await getAllProjects();
        console.log("Projects:", allProjects);
        return allProjects;
    } catch (err) {
        console.error("Failed to fetch projects:", err);
        // throw err; 
    }
};

export default dashboardLoader;