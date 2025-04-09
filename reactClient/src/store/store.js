import {configureStore} from "@reduxjs/toolkit"
import uiReducer from "./uiSlice.js"
import authReducer from "./authSlice.js"

const store = configureStore({
    reducer:{
        auth:authReducer,
        ui:uiReducer,
    }
})

export default store