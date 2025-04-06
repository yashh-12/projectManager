import { createSlice } from "@reduxjs/toolkit";
import { useEffect } from "react";



const initialState = {
    userState:false,
    userData:{}
}

const authSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        dispatchLogin:(state,action)=>{
            
            state.userState = true;
            state.userData = action.payload;
        },
        dispatchLogout:(state,action)=>{
            state.userState = false;
            state.userData = {};
        }
    }
})

export const {dispatchLogin,dispatchLogout} = authSlice.actions;
export default authSlice.reducer;