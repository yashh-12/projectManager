const createTeam = async (projectId, name,) => {
    try {
        const res = await fetch(`http://localhost:8080/api/teams/${projectId}/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                name,
                deadline: null,
            }),
        })

        return res.json()
    } catch (error) {
        console.log(error);

    }
}

const deleteTeam = async (teamId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/teams/${teamId}/delete`, {
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

// const modify = async () => {}

const assignMemberToTeam = async (teamId, members) => {
    try {
        const res = await fetch(`http://localhost:8080/api/teams/${teamId}/addMembers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                members,
            })
        })

        return res.json()
    } catch (error) {
        console.log(error);

    }
}

const removeMemberToTeam = async (teamId, members) => {
    try {
        const res = await fetch(`http://localhost:8080/api/teams/${teamId}/removeMembers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                members,
            })
        })

        return res.json()
    } catch (error) {
        console.log(error);

    }
}

const getTeamData = async (teamId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/teams/${teamId}/data`, {
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

const getUnassignedUsers = async (teamId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/teams/${teamId}/getAllUnassignedUsers`, {
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

const getAllAssignedUsers = async (teamId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/teams/${teamId}/getAllAssignedUsers`, {
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
    createTeam,
    deleteTeam,
    assignMemberToTeam,
    removeMemberToTeam,
    // modify,
    getTeamData,
    getUnassignedUsers,
    getAllAssignedUsers
}