import {configureStore} from "@reduxjs/toolkit"
import uiReducer from "./uiSlice.js"
import authReducer from "./authSlice.js"
import taskReducer from "./taskSlice.js"

const store = configureStore({
    reducer:{
        auth:authReducer,
        ui:uiReducer,
        tasks:taskReducer
    }
})

export default store