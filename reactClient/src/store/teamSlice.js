import { createSlice } from "@reduxjs/toolkit"
import { act } from "react"
const initialState = {
    teams: []
}

const teamSlice = createSlice({
    name:"projects",
    initialState,
    reducers:{
        setTeams : (state,action) => {
            state.projects = action.payload
        },
        addTeam : (state,action) => {
            state.projects.push(action.payload)
        },
        removeTeam : (state , action) => {
            state.projects.filter(project => project._id != action.payload) 
        }
    }
})

export const { setTeams , addTeam, removeTeam } = teamSlice.actions;

export default teamSlice.reducer;