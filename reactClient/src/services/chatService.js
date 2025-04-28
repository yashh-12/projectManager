const sendMessage = async (recipientId, message,projectId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/chats/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                recipientId,
                message,
                projectId
            }),
        })

        return res.json()
    } catch (error) {
        console.log(error);

    }
}

const sendGroupMessage = async (message,projectId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/chats/groupchat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                message,
                projectId
            }),
        })

        return res.json()
    } catch (error) {
        console.log(error);

    }
}

const getMessages = async (recipientId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/chats/${recipientId}/messages`, {
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

const getGroupChat = async (projectId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/chats/${projectId}/groupchat`, {
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

const getUnreadChatCount = async (projectId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/chats/${projectId}/getUnreadChatCount`, {
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

export { sendMessage, getMessages ,getGroupChat,sendGroupMessage,getUnreadChatCount}
