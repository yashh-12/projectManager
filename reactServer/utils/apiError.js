
class apiError{
    constructor(status, message) {
        this.message = message;
        this.status = status;
        this.success = false;
    }
}

export default apiError;