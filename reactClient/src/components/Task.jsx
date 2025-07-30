import React, { useEffect, useRef, useState } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import { addTask, assignTaskToTeam, deleteTask, removeATeam, modifyTask, getTaskData, toggleTaskStatus } from '../services/taskService.js';
import { useDispatch, useSelector } from 'react-redux';
import { setLoaderTrue, setLoaderFalse } from '../store/uiSlice.js';
import { FaEllipsisV, FaSadCry } from 'react-icons/fa';
import { getAllTasks, getAllTeams, getProjectMetaData } from "../services/projectService.js"
import TaskDetail from './TaskDetail.jsx';
import FlashMsg from './FlashMsg.jsx';
import useSocket from '../provider/SocketProvider.jsx';
import { createNotification } from '../services/notificationService.js';
import { getTeamMembers } from '../services/teamService.js';
import { dispatchOwnerFalse, dispatchOwnerTrue } from '../store/authSlice.js';
import { da } from 'date-fns/locale';

function Task() {

    const { projectId } = useParams();
    const dispatch = useDispatch()

    const { client } = useSocket();

    const [addTaskForm, setAddTaskForm] = useState(false);
    const [taskName, setTaskName] = useState('');
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    const [deadline, setDeadline] = useState(oneWeekFromNow);
    const [details, setDetails] = useState('');
    const { tasks, projectData } = useLoaderData()
    console.log("tasks", tasks);

    const [dropdownIndex, setDropdownIndex] = useState(null);
    const [allTeams, setAllTeams] = useState([])
    const [assignForm, setAssignForm] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState(null)
    const [taskDetails, setTaskDetails] = useState({})
    const [showTaskDetails, setShowTaskDetails] = useState(false)
    const [formTaskId, setFormTaskID] = useState(null)
    const [allTasks, setAllTasks] = useState(tasks?.data || [])
    const [modifyForm, setModifyForm] = useState(false)
    const [originalTeam, setOriginalTeam] = useState()
    const [searchText, setSearchText] = useState("")
    const [notification, setNotification] = useState("")

    const userData = useSelector(state => state?.auth?.userData)

    useEffect(() => {
        if (userData._id == projectData?.data?.owner) {
            dispatch(dispatchOwnerTrue())
        } else {
            dispatch(dispatchOwnerFalse())
        }

    }, [dispatch, projectId])
    console.log("over ", allTasks);


    const isProjectOwner = userData?.owner;
    console.log(isProjectOwner);

    useEffect(() => {

        if (!client)
            return;

        client.emit("register", { userId: userData._id, projectId });

        client.on("recTask", (data) => {
            setAllTasks(prev => [...prev, data])

        })

        client.on("remTask", (data) => {
            setAllTasks(prev => prev.filter(ele => ele._id != data))
        })

        client.on("modify", (data) => {
            console.log("this ", data, " ", allTasks);

            setAllTasks(prev => prev.map(ele => ele._id == data._id ? { ...ele, task: data.task, details: data.details, deadline: data.deadline } : ele))
        })

    }, [client])

    useEffect(() => {
        if (assignForm) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }
    }, [assignForm]);

    useEffect(() => {
        setAllTeams(originalTeam?.filter(team => team.name.includes(searchText.toLowerCase() || "")))
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
            setNotification("Task added successfully")
            setTimeout(() => {
                setNotification("")
            }, 2000)
        }

    };

    const handleModify = async (task) => {
        console.log('Modify Task:', task);
        setTaskName(task.task);
        setDetails(task.details);
        const formattedDate = task.deadline?.split('T')[0];
        setDeadline(formattedDate);

        setModifyForm(true);

    };

    const handleModifyTask = async (e) => {
        e.preventDefault();
        const res = await modifyTask(formTaskId, taskName, details, deadline);
        console.log(res);

        if (res.success) {
            console.log('Task modified successfully:', res);
            const taskTomodify = allTasks.find(task => task._id === formTaskId)
            const modifiedTask = { ...taskTomodify, task: taskName, details: details, deadline: deadline }
            setAllTasks(allTasks.map(task => task._id === formTaskId ? { ...task, task: taskName, details: details, deadline: deadline } : task))
            client.emit("modifyTask", { task: modifiedTask, members: modifiedTask.teamMemberIds,projectId })
            setModifyForm(false);
            setTaskName('');
            setDetails('');
            setDeadline('');
            setFormTaskID(null)
            setNotification("Task modified successfully")
            setTimeout(() => {
                setNotification("")
            }, 2000)
        }
        setDropdownIndex(null);
    }

    const handleDelete = async (taskId) => {
        const res = await deleteTask(taskId)
        if (res?.success) {
            console.log('Task deleted successfully:', res.data);
            setDropdownIndex(null)
            const taskTodelete = allTasks.find(task => task._id == taskId)
            await createNotification(taskTodelete.teamMemberIds, `Task "${taskTodelete?.task}" is deleted which was assigned to your team`)
            client.emit("deletedTask", { taskId, members: taskTodelete.teamMemberIds || [] , projectId })
            setNotification("Task deleted successfully")
            setAllTasks(allTasks.filter(task => task._id !== taskId))
            setTimeout(() => {
                setNotification("")
            }, 2000)
        }
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
        const res = await assignTaskToTeam(formTaskId, selectedTeam._id);
        if (res.success) {
            console.log('Task assigned successfully:', res);
            setAssignForm(false);

            const targetedTask = allTasks.find(task =>
                task._id === formTaskId
            )

            const members = selectedTeam.team_members.map(member => member._id);
            setAllTasks(allTasks.map(task =>
                task._id === formTaskId ? { ...task, team: { _id: selectedTeam._id, name: selectedTeam.name }, teamMemberIds: members, project: selectedTeam?.project } : task
            ));


            setNotification("Task assigned successfully")

            const updatedTargetedTask = {
                ...targetedTask,
                team: {
                    _id: selectedTeam._id,
                    name: selectedTeam.name,
                    team_members: selectedTeam.team_members
                },
                project: selectedTeam.project,
                teamMemberIds: members
            };

            console.log("ajs ", updatedTargetedTask);

            const resp = await createNotification(members, `Task "${updatedTargetedTask?.task}" is assigned to your team "${updatedTargetedTask?.team?.name}"`)

            client.emit("teamAssigned", { members, updatedTargetedTask ,projectId })
            setFormTaskID(null)
            setSelectedTeam(null)

            setTimeout(() => {
                setNotification("")
            }, 2000)
        }

        setDropdownIndex(null);
    };

    const handleRemoveTeam = async (taskId) => {
        // dispatch(setLoaderTrue());
        const res = await removeATeam(taskId)
        if (res.success) {
            console.log('Team removed successfully:', res);
            const taskTobeRemoved = allTasks.find(task => task._id == taskId);
            setAllTasks(allTasks.map(task => task._id === taskId ? { ...task, team: null } : task))
            const members = taskTobeRemoved.teamMemberIds || [];
            // console.log(taskTobeRemoved);

            await createNotification(members, `Your team "${taskTobeRemoved?.team?.name}" is removed from the task "${taskTobeRemoved?.task}" `)
            client.emit("removeTeam", { taskId, members ,projectId })
            setNotification("Team removed successfully")
            setTimeout(() => {
                setNotification("")
            }, 2000)
        }
        setDropdownIndex(null);
    };

    const getTaskDetails = async (taskId) => {

        const res = await getTaskData(taskId)
        console.log("Task Details", res);
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
            if (res?.data?.status) {
                setNotification("Task Marked as Complete")
                setTimeout(() => {
                    setNotification("")
                }, 2000)
            } else {
                setNotification("Task Marked as Pending")
                setTimeout(() => {
                    setNotification("")
                }, 2000)
            }
        }
    }

    return (
        <>
            {notification && <FlashMsg message={notification} setMessage={() => setNotification("")} />}
            <div className="relative flex flex-col space-y-4 w-full">

                {isProjectOwner && <div className="mb-4 flex justify-end">
                    <button
                        onClick={() => setAddTaskForm(!addTaskForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
                    >
                        + Add Task
                    </button>
                </div>}




                {addTaskForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                        <form
                            onSubmit={handleAddTask}
                            className="bg-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-5 border border-gray-700"
                        >
                            <h2 className="text-2xl font-bold text-white text-center">Add New Task</h2>

                            <input
                                type="text"
                                required
                                placeholder="Task Name"
                                value={taskName}
                                autoFocus
                                onChange={(e) => setTaskName(e.target.value)}
                                className="p-3 rounded-lg w-full bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <textarea
                                required
                                placeholder="Task Details"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                rows="3"
                                className="p-3 rounded-lg w-full bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>

                            <input
                                type="date"
                                required
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="p-3 rounded-lg w-full bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="flex justify-between gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAddTaskForm(false)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-all duration-200 shadow-md hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all duration-200 shadow-md hover:scale-105"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                {showTaskDetails && <TaskDetail task={taskDetails} onClose={() => setShowTaskDetails(false)} />}

                {modifyForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
                        <form
                            onSubmit={handleModifyTask}
                            className="bg-[#1e1e2e] text-white p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-5 border border-gray-700"
                        >
                            <h2 className="text-2xl font-bold border-b border-gray-600 pb-3 text-center">
                                Modify Task
                            </h2>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Task Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter task name"
                                    value={taskName}
                                    autoFocus
                                    onChange={(e) => setTaskName(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Details</label>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="Task details..."
                                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Deadline</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModifyForm(false);
                                        setTaskName('');
                                        setDetails('');
                                        setDeadline('');
                                        setDropdownIndex(null)
                                    }}
                                    className="bg-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-transform transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105"
                                >
                                    Modify
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {assignForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
                        <form
                            onSubmit={(e) => handleAssignTeamToTask(e)}
                            className="bg-[#1e1e2e] p-8 rounded-2xl shadow-2xl w-full max-w-lg space-y-6 border border-gray-700 text-white"
                        >
                            <h2 className="text-2xl font-bold border-b border-gray-600 pb-3 text-center">
                                Assign Team to Task
                            </h2>

                            <div>
                                <label className="block text-sm font-medium mb-2">Search Teams</label>
                                <input
                                    type="text"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Type to filter teams..."
                                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-3 overflow-y-auto pr-2 max-h-[20rem] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                                {allTeams.length > 0 ? (
                                    allTeams.map((ele) => (
                                        <label
                                            key={ele._id}
                                            className={`flex items-center gap-3 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-gray-700 ${selectedTeam === ele._id ? "border-blue-500" : "border-gray-600"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="team"
                                                value={ele._id}
                                                checked={selectedTeam === ele}
                                                onChange={() => {
                                                    setSelectedTeam(ele);
                                                }}
                                                className="w-5 h-5 accent-blue-600"
                                            />
                                            <span className="text-lg">{ele.name}</span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400">No teams available</p>
                                )}
                            </div>


                            <div className="flex justify-end gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAssignForm(false)}
                                    className="bg-red-600 px-5 py-2 rounded-lg font-semibold hover:bg-red-700 transition-transform transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105"
                                >
                                    Assign
                                </button>
                            </div>
                        </form>
                    </div>
                )}




                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {allTasks.map((task, index) => (
                        <div
                            key={index}
                            className="relative bg-gray-800 hover:bg-gray-700 border border-gray-700 p-5 rounded-2xl text-white shadow-xl transition-transform transform hover:-translate-y-1 hover:shadow-2xl"
                        >
                            <div className="absolute top-3 right-3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={!!task?.status}
                                    onChange={() => handleTaskToggleStatus(task._id)}
                                    className="w-5 h-5 text-blue-500 bg-blue-700 border-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />


                                <div className="relative">
                                    {isProjectOwner && <button
                                        onClick={() => setDropdownIndex(dropdownIndex === index ? null : index)}
                                        className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                                    >
                                        <FaEllipsisV className="text-gray-400 hover:text-white text-sm" />
                                    </button>}

                                    {dropdownIndex === index && (
                                        <div className="absolute right-0 top-10 w-52 z-30 rounded-xl shadow-xl border border-gray-700 bg-[#1e1e2e] overflow-hidden backdrop-blur-sm transition-all duration-300">
                                            <button
                                                onClick={() => {
                                                    handleModify(task);
                                                    setFormTaskID(task._id);
                                                }}
                                                className="w-full text-left px-5 py-3 text-sm font-medium text-white hover:bg-[#313244] transition-colors"
                                            >
                                                Modify
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task._id)}
                                                className="w-full text-left px-5 py-3 text-sm font-medium text-red-400 hover:bg-[#3b2a2a] hover:text-red-300 transition-colors"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleAssignTeam(task._id);
                                                    setFormTaskID(task._id);
                                                }}
                                                className="w-full text-left px-5 py-3 text-sm font-medium text-white hover:bg-[#313244] transition-colors"
                                            >
                                                Assign Team
                                            </button>
                                            <button
                                                onClick={() => handleRemoveTeam(task._id)}
                                                className="w-full text-left px-5 py-3 text-sm font-medium text-yellow-400 hover:bg-[#443c25] hover:text-yellow-300 transition-colors"
                                            >
                                                Remove Team
                                            </button>
                                        </div>
                                    )}

                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <h2
                                    className="text-lg font-bold cursor-pointer hover:text-blue-400 transition-colors"
                                    onClick={() => getTaskDetails(task._id)}
                                >
                                    {task.task}
                                </h2>

                                <p className="text-sm text-gray-300 line-clamp-3">
                                    Details : {task.details}
                                </p>

                                <p className="text-sm text-gray-400">
                                    {task?.team?.name ? <span className="text-sm text-gray-300">Team : {task.team.name} </span> : <span className="italic text-gray-500">No Team Assigned</span>}
                                </p>

                                <p className="text-sm text-gray-400">
                                    Deadline:{" "}
                                    {task?.deadline?.slice(0, 10) || (
                                        <span className="italic text-gray-500">No Deadline</span>
                                    )}
                                </p>
                            </div>

                            <div className="mt-4 text-right">
                                <span
                                    className={`text-sm font-semibold px-3 py-1 rounded-full ${task.status ? "bg-green-700 text-green-300" : "bg-yellow-700 text-yellow-300"
                                        }`}
                                >
                                    {task.status ? "Done" : "Pending"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>



            </div>
        </>
    );
}

export default Task;
