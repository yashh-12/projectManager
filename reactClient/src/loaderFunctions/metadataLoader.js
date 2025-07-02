import { getMetadataForDashBoard } from "../services/projectService"

const metadataLoader = async () => {
    const metaData = await getMetadataForDashBoard();
    console.log(metaData);
    
    return metaData;
}

export default metadataLoader