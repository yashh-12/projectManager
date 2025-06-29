const createNotification = async (userIds,message) => {
    try {
        const res = await fetch(`http://localhost:8080/api/notifications/createNotification`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                message,
                userIds
            })
        })

        return res.json()
    } catch (error) {
        console.log(error);

    }
}

const clearAllNotification = async () => {
    try {
        const res = await fetch(`http://localhost:8080/api/notifications/clearAllNotification`, {
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

const notificationMarkAsRead = async (notifications) => {
    try {
        const res = await fetch(`http://localhost:8080/api/notifications/markasread`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                notifications
            })
        })

        return res.json()
    } catch (error) {
        console.log(error);

    }
}

const deleteNotification = async (notificationId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/notifications/${notificationId}/delete`, {
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

const getAllUnreadNotification = async () => {
    try {
        const res = await fetch(`http://localhost:8080/api/notifications/getUnreadNotification`, {
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

const getAllreadNotification = async () => {
    try {
        const res = await fetch(`http://localhost:8080/api/notifications/getreadNotification`, {
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

const getUnreadNotificationCount = async () => {
    try {
        const res = await fetch(`http://localhost:8080/api/notifications/getUnreadNotificationCount`, {
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
    createNotification,clearAllNotification,getAllUnreadNotification,getUnreadNotificationCount,deleteNotification,notificationMarkAsRead,getAllreadNotification
}