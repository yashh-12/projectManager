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
        },
        dispatchAvatar:(state,action) => {
            state.userData = {...state.userData, avatar: action.payload}; 
        }
    }
})

export const {dispatchLogin,dispatchLogout,dispatchAvatar} = authSlice.actions;
export default authSlice.reducer;