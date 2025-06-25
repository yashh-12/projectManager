import { getMetadataForDashBoard } from "../services/projectService"

const metadataLoader = async () => {
    const metaData = await getMetadataForDashBoard();

    return metaData;
}

export default metadataLoader