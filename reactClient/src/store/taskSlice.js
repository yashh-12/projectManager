import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tasks: []
};

const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        setTasks: (state, action) => {
            state.tasks = action.payload;
        },
        addTask: (state, action) => {
            state.tasks = [...state.tasks, action.payload];
        },
        removeTask: (state, action) => {
            state.tasks = state.tasks.filter(task => task._id !== action.payload);
        }
    }
});

export const { setTasks, addTask, removeTask } = taskSlice.actions;
export default taskSlice.reducer;
