import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loader:false,
    
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
        }
    }
})

export const {setLoaderTrue,setLoaderFalse} = uiSlice.actions;
export default uiSlice.reducer;