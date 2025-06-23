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
        },
        dispatchOwnerTrue : (state,action) => {
            state.userData = {...state.userData, owner: true}; 
        },
        dispatchOwnerFalse : (state,action) => {
            state.userData = {...state.userData, owner: false}; 
        },
    }
})

export const {dispatchLogin,dispatchLogout,dispatchAvatar,dispatchOwnerTrue,dispatchOwnerFalse} = authSlice.actions;
export default authSlice.reducer;