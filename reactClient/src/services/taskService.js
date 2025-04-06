const addTask = async (projectId, task, details, deadline) => {
    try {
        const res = await fetch(`http://localhost:8080/api/tasks/${projectId}/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                task,
                details,
                deadline
            }),
        })
        return res.json()
    } catch (error) {
        console.log(error);
    }

}

const deleteTask = async (taskId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/tasks/${taskId}/delete`, {
            method: "DELETE",
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

const modifyTask = async (taskId, task, details, deadline) => {
    try {
        const res = await fetch(`http://localhost:8080/api/tasks/${taskId}/update`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                task,
                details,
                deadline
            }),
        })
        return res.json()
    } catch (error) {
        console.log(error);

    }
}

const assignTaskToTeam = async (taskId, teamId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/tasks/${taskId}/assign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                teamId
            }),
        })

        return res.json()
    } catch (error) {
        console.log(error);

    }
}

const removeATeam = async (taskId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/tasks/${taskId}/unassign`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        })

        return res.json()
    }
    catch (error) {
        console.log(error);

    }
}

const getTaskData = async (taskId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/tasks/${taskId}/data`, {
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

const toggleTaskStatus = async (taskId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/tasks/${taskId}/togglestatus`, {
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

export {
    addTask,
    deleteTask,
    modifyTask,
    assignTaskToTeam,
    removeATeam,
    getTaskData,
    toggleTaskStatus,
}