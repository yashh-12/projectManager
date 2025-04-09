const sendMessage = async (recipientId, message) => {
    try {
        const res = await fetch(`http://localhost:8080/api/chats/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                recipientId,
                message
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

export { sendMessage, getMessages }
