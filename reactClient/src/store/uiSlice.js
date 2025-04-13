import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loader:false,
    message:''
}

const uiSlice = createSlice({
    name:"ui",
    initialState,
    reducers:{
        setLoaderTrue : (state) =>{
            state.loader = true;;
        },
        setLoaderFalse : (state) =>{
            state.loader = false;
        },
        setMessage : (state,action) =>{
            state.message = action.payload;
        },
        clearMessage : (state) =>{
            state.message = '';
        }
        
    }
})

export const {setLoaderTrue,setLoaderFalse,clearMessage,setMessage} = uiSlice.actions;
export default uiSlice.reducer;