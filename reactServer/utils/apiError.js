
class apiError{
    constructor(statusCode, message) {
        this.message = message;
        this.statusCode = statusCode;
        this.success = false;
    }
}

export default apiError;