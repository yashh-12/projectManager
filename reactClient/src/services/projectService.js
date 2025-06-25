const createProject = async (name, deadline) => {
  try {
    const res = await fetch("http://localhost:8080/api/projects/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        deadline
      }),
      credentials: "include",
    })
    return res.json();
  } catch (error) {
    console.log(error);
  }
}

const updateProject = async (projectId, name, deadline) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        deadline
      }),
      credentials: "include",
    })
    return res.json();
  } catch (error) {
    console.log(error);

  }

}

const deleteProject = async (projectId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json();
  } catch (error) {
    console.log(error);

  }

}

const toggleIsCompleted = async (projectId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/toggleIsCompleted`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json();
  } catch (error) {
    console.log(error);

  }

}

const addAFile = async (projectId, file) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/addFile`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: new FormData({ file }),
      credentials: "include",
    })
    return res.json();
  } catch (error) {
    console.log(error);

  }

}


const removeAFile = async (projectId, fileId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/removeAFile`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const getProjectMetaData = async (projectId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/getProjectMetaData`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const getMetadataForDashBoard = async () => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/getMetaDataForDashBoard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const getAllTeams = async (projectId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/getAllTeams`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const getAllTasks = async (projectId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/getAllTasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const getMyProjects = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/projects/myProjects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }
}

const getJoinedProjects = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/projects/joinedProjects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const getAllProjects = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/projects/allProjects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const getProjectOverview = async (projectId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/getProjectOverview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }
}

const markProjectAsDone = async (projectId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/markAsCompleted`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }
}

const markProjectAsNotDone = async (projectId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/markAsIncomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }
}

const getProjectMembers = async (projectId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/projects/${projectId}/getProjectMembers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }
}

export {
  createProject,
  updateProject,
  deleteProject,
  toggleIsCompleted,
  addAFile,
  removeAFile,
  getProjectMetaData,
  getAllTeams,
  getAllTasks,
  getMyProjects,
  getJoinedProjects,
  getAllProjects,
  getProjectOverview,
  markProjectAsDone,
  markProjectAsNotDone,
  getProjectMembers,
  getMetadataForDashBoard
}
