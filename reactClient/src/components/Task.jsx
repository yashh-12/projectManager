import React, { useEffect, useState } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import { addTask, assignTaskToTeam, deleteTask, removeATeam, modifyTask, getTaskData, toggleTaskStatus } from '../services/taskService.js';
import { useDispatch, useSelector } from 'react-redux';
import { setLoaderTrue, setLoaderFalse } from '../store/uiSlice.js';
import { FaEllipsisV, FaSadCry } from 'react-icons/fa';
import { getAllTasks, getAllTeams } from "../services/projectService.js"
import { setTasks, addTask as addTaskToStore } from '../store/taskSlice.js';
import TaskDetail from './TaskDetail.jsx';

function Task() {

    const dispatch = useDispatch();
    const [addTaskForm, setAddTaskForm] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [deadline, setDeadline] = useState(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const [details, setDetails] = useState('');
    const { projectId } = useParams();
    const tasks = useLoaderData()
    console.log("tasks", tasks);

    const [dropdownIndex, setDropdownIndex] = useState(null);
    const [allTeams, setAllTeams] = useState([])
    const [assignForm, setAssignForm] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState(null)
    const [selectedTeamName, setSelectedTeamName] = useState("")
    const [taskDetails, setTaskDetails] = useState({})
    const [showTaskDetails, setShowTaskDetails] = useState(false)
    const [formTaskId, setFormTaskID] = useState(null)
    const [allTasks, setAllTasks] = useState(tasks?.data || [])
    const [modifyForm, setModifyForm] = useState(false)
    // const [modifyTask, setModifyTask] = useState({})
    const [isThereLoaderData, setIsThereLoaderData] = useState(true)
    const [originalTeam, setOriginalTeam] = useState([])
    const [searchText, setSearchText] = useState("")

    useEffect(() => {
        setAllTeams(originalTeam.filter(team => team.name.toLowerCase().includes(searchText.toLowerCase() || '')))

    }, [searchText])



    const handleAddTask = async (e) => {
        e.preventDefault();
        console.log('Task Added:', { taskName, details, deadline, projectId });
        const res = await addTask(projectId, taskName, details, deadline);
        if (res.success) {
            console.log('Task added successfully:', res);
            setAddTaskForm(false);
            setTaskName('');
            setDetails('');
            setDeadline('');
            setAllTasks([...allTasks, res.data])
        }

    };

    const handleModify = async (task) => {
        console.log('Modify Task:', task);
        setTaskName(task.task);
        setDetails(task.details);
        setDeadline(task.deadline);

        setModifyForm(true);

    };

    const handleModifyTask = async (e) => {
        e.preventDefault();
        const res = await modifyTask(formTaskId, taskName, details, deadline);
        console.log(res);

        if (res.success) {
            console.log('Task modified successfully:', res);
            setAllTasks(allTasks.map(task => task._id === formTaskId ? { ...task, task: taskName, details: details, deadline: deadline } : task))
            setModifyForm(false);
            setTaskName('');
            setDetails('');
            setDeadline('');
            setFormTaskID(null)
        }
        setDropdownIndex(null);
    }

    const handleDelete = async (taskId) => {
        const res = await deleteTask(taskId)
        if (res?.success) {
            console.log('Task deleted successfully:', res.data);
            setDropdownIndex(null)
        }
        setAllTasks(allTasks.filter(task => task._id !== taskId))
    };

    const handleAssignTeam = async () => {
        const res = await getAllTeams(projectId)
        console.log('Assign Team to Task:', res);
        if (res?.success) {
            setAllTeams(res.data);
            setOriginalTeam(res.data)
            setAssignForm(true);
            setDropdownIndex(null);
        }
    };

    const handleAssignTeamToTask = async (e) => {
        e.preventDefault();
        const res = await assignTaskToTeam(formTaskId, selectedTeam);
        if (res.success) {
            console.log('Task assigned successfully:', res);
            setAssignForm(false);
            console.log(selectedTeamName);
            setAllTasks(allTasks.map(task =>
                task._id === formTaskId ? { ...task, team: { _id: selectedTeam, name: selectedTeamName } } : task
            ));
            setFormTaskID(null)
            setSelectedTeam(null)

        }

        setDropdownIndex(null);
    };

    const handleRemoveTeam = async (taskId) => {
        // dispatch(setLoaderTrue());
        const res = await removeATeam(taskId)
        if (res.success) {
            console.log('Team removed successfully:', res);
            setAllTasks(allTasks.map(task => task._id === taskId ? { ...task, assign: null } : task))
            console.log(allTasks);

        }
        setDropdownIndex(null);
    };

    const getTaskDetails = async (taskId) => {

        const res = await getTaskData(taskId)
        if (res?.success) {
            setTaskDetails(res.data)
            setShowTaskDetails(true)
        }
        console.log(res);


    }

    const handleTaskToggleStatus = async (taskId) => {
        const res = await toggleTaskStatus(taskId)
        console.log(res);

        if (res.success) {
            console.log('Task status toggled successfully:', res);
            setAllTasks(allTasks.map(task => task._id === taskId ? { ...task, status: !task.status } : task))
        }
    }

    return (
        <div className="relative flex flex-col space-y-4 w-full">
            <div className="flex justify-end">
                <button
                    onClick={() => setAddTaskForm(!addTaskForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
                >
                    + Add Task
                </button>
            </div>

            {addTaskForm && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-10">
                    <form onSubmit={handleAddTask} className="bg-gray-800 p-6 rounded-lg shadow-xl w-96 space-y-4">
                        <h2 className="text-xl font-semibold text-white">Add New Task</h2>
                        <input
                            type="text"
                            placeholder="Task Name"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            className="p-3 border rounded-lg bg-gray-700 text-white w-full"
                        />
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Task Details"
                            className="p-3 border rounded-lg bg-gray-700 text-white w-full"
                        />
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="p-3 border rounded-lg bg-gray-700 text-white w-full"
                        />
                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={() => setAddTaskForm(false)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                            >
                                Submit Task
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showTaskDetails && <TaskDetail task={taskDetails} onClose={() => setShowTaskDetails(false)} />}

            {modifyForm && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-10">
                    <form onSubmit={handleModifyTask} className="bg-gray-800 p-6 rounded-lg shadow-xl w-96 space-y-4">
                        <h2 className="text-xl font-semibold text-white">Modify Task</h2>
                        <input
                            type="text"
                            placeholder="Task Name"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            className="p-3 border rounded-lg bg-gray-700 text-white w-full"
                        />
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Task Details"
                            className="p-3 border rounded-lg bg-gray-700 text-white w-full"
                        />
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="p-3 border rounded-lg bg-gray-700 text-white w-full"
                        />
                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    setModifyForm(false);
                                    setTaskName('');
                                    setDetails('');
                                    setDeadline('');
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                            >
                                Modify Task
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {assignForm && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                    <form
                        onSubmit={(e) => handleAssignTeamToTask(e)}
                        className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-lg space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-white">Assign Team</h2>

                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                        />

                        <div className="space-y-4">
                            {allTeams.length > 0 ? (
                                allTeams.map((ele) => (
                                    <label
                                        key={ele._id}
                                        className="flex items-center space-x-3 bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-300"
                                    >
                                        <input
                                            type="radio"
                                            name="team"
                                            value={ele._id}
                                            onChange={() => { setSelectedTeam(ele._id); setSelectedTeamName(ele.name); }}
                                            className="w-5 h-5 text-blue-500 focus:ring-2 focus:ring-blue-400"
                                        />
                                        <span className="text-white text-lg">{ele.name}</span>
                                    </label>
                                ))
                            ) : (
                                <p className="text-gray-400">No teams available</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setAssignForm(false)}
                                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                            >
                                Assign Team
                            </button>
                        </div>
                    </form>
                </div>
            )}


            <div className="w-full bg-gray-800 p-6 rounded-lg shadow-lg">
                {/* Header */}
                <div className="grid grid-cols-5 gap-4 p-4 font-semibold bg-gray-700 rounded-lg mb-4 text-white">
                    <div>Task</div>
                    <div>Details</div>
                    <div>Team</div>
                    <div>Deadline</div>
                    <div>Status</div>
                </div>

                {/* Task Rows */}
                <div className="space-y-4">
                    {allTasks.map((task, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-5 gap-4 items-center bg-gray-750 border border-gray-700 p-4 rounded-lg text-white"
                        >
                            {/* Column 1: Task */}
                            <div
                                className="text-lg font-medium cursor-pointer hover:underline"
                                onClick={() => getTaskDetails(task._id)}
                            >
                                {task.task}
                            </div>

                            {/* Column 2: Details */}
                            <p className="text-sm text-gray-300">{task.details}</p>

                            {/* Column 3: Team */}
                            <p className="text-sm text-gray-400">
                                {task?.team?.name || "No Team Assigned"}
                            </p>

                            {/* Column 4: Deadline */}
                            <p className="text-sm text-gray-400">
                                {task?.deadline?.slice(0, 10) || "No Deadline"}
                            </p>

                            {/* Column 5: Status + Menu */}
                            <div className="flex items-center justify-between space-x-2">
                                <label className="flex items-center space-x-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={!!task?.status}
                                        onChange={() => handleTaskToggleStatus(task._id)}
                                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    />
                                    <span>{task.status ? "Done" : "Pending"}</span>
                                </label>

                                {/* Dropdown */}
                                <div className="relative">
                                    <button
                                        className="p-2 text-gray-400 hover:text-white"
                                        onClick={() =>
                                            setDropdownIndex(dropdownIndex === index ? null : index)
                                        }
                                    >
                                        <FaEllipsisV />
                                    </button>

                                    {dropdownIndex === index && (
                                        <div className="absolute top-full right-0 bg-gray-700 rounded-lg shadow-lg w-44 mt-2 z-10">
                                            <button
                                                onClick={() => (handleModify(task), setFormTaskID(task._id))}
                                                className="block w-full px-4 py-2 text-white hover:bg-gray-600 text-left"
                                            >
                                                ✏️ Modify
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task._id)}
                                                className="block w-full px-4 py-2 text-red-500 hover:bg-gray-600 text-left"
                                            >
                                                🗑️ Delete
                                            </button>
                                            <button
                                                onClick={() =>
                                                    (handleAssignTeam(task._id), setFormTaskID(task._id))
                                                }
                                                className="block w-full px-4 py-2 text-white hover:bg-gray-600 text-left"
                                            >
                                                👥 Assign Team
                                            </button>
                                            <button
                                                onClick={() => handleRemoveTeam(task._id)}
                                                className="block w-full px-4 py-2 text-yellow-500 hover:bg-gray-600 text-left"
                                            >
                                                ❌ Remove Team
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>



        </div>
    );
}

export default Task;
