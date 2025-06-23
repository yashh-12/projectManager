import React, { useState, useEffect } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import { assignMemberToTeam, createTeam, deleteTeam, getAllAssignedUsers, getTeamData, removeMemberToTeam } from '../services/teamService.js';
import { useDispatch, useSelector } from 'react-redux';
import { setLoaderTrue, setLoaderFalse } from '../store/uiSlice.js';
import { FaEllipsisV } from 'react-icons/fa';
import { getAllTeams } from '../services/projectService.js';
import { getAllUser } from '../services/authService.js';
import { getUnassignedUsers } from '../services/teamService.js';
import TeamList from './TeamList.jsx';
import useSocket from '../provider/SocketProvider.jsx';
import { dispatchOwnerFalse, dispatchOwnerTrue } from '../store/authSlice.js';

function Team() {

  const { client } = useSocket();
  const dispatch = useDispatch();
  const [addTeamForm, setAddTeamForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const { projectId } = useParams();
  const { aTeams, projectData } = useLoaderData();
  console.log(aTeams);

  useEffect(() => {
    if (userData._id == projectData?.data?.owner) {
      dispatch(dispatchOwnerTrue())
    } else {
      dispatch(dispatchOwnerFalse())
    }

  }, [dispatch, projectId])

  const userData = useSelector(state => state?.auth?.userData)
  const isProjectOwner = userData?.owner;

  console.log(isProjectOwner);


  const [assignMemberForm, setAssignMemberForm] = useState(false);
  const [removeMemberForm, setRemoveMemberForm] = useState(false);

  const [allTeams, setAllTeams] = useState(aTeams?.data || []);
  const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamData, setShowTeamData] = useState(false);
  const [selectedTeamData, setSelectedTeamData] = useState({})
  const [searchText, setSearchText] = useState("")
  const [originalUsers, setOriginalUsers] = useState([])

  useEffect(() => {
    setAllUsers(originalUsers.filter(user => user?.name?.toLowerCase().includes(searchText.toLowerCase() || '')))
  }, [searchText])

  useEffect(() => {

    if (!client)
      return;

    client.on("assignMember", (data) => {
      setAllTeams(prev => [...prev, data])
    })

    client.on("removeFromTeam", (data) => {
      setAllTeams(prev => prev.filter(ele => ele._id != data))
    })

    client.on("deleteTeam", (data) => {
      setAllTeams(prev => prev.filter(ele => ele._id != data._id))
    })


  }, [client])

  useEffect(() => {
    if (assignMemberForm || removeMemberForm) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [assignMemberForm, removeMemberForm]);


  const handleAddTeam = async (e) => {
    e.preventDefault();
    console.log('Team Added:', { teamName, projectId });
    const res = await createTeam(projectId, teamName);
    if (res?.success) {
      console.log('Team added successfully:', res.data);
      setAddTeamForm(false);
      setTeamName('');
      setDropdownIndex(null);
      setAllTeams([...allTeams, res.data])
    }
  };

  const handleDelete = async (teamId) => {
    console.log('Team Deleted:', teamId);
    const res = await deleteTeam(teamId);
    // console.log(res);

    if (res.success) {
      console.log(allTeams);

      const teamToDelete = allTeams.find(team => team._id == teamId)

      console.log(teamToDelete);
      const members = teamToDelete.team_members.map(ele => ele._id) || []
      console.log(members);

      client.emit("deletedTeam", { teamToDelete, members })
      setAllTeams(allTeams.filter(team => team._id !== teamId));
      setDropdownIndex(null)
    }

  };

  const handleAssignMember = async (teamId) => {
    console.log('Assign Member to Team:', teamId);
    const res = await getUnassignedUsers(teamId);
    console.log(res);

    if (res?.success) {
      setAllUsers(res?.data ?? []);
      setOriginalUsers(res?.data ?? [])
      setSelectedTeam(teamId);
      setAssignMemberForm(true);
    }

  };

  const handleAssignForm = async (e) => {
    e.preventDefault();

    const res = await assignMemberToTeam(selectedTeam, selectedUsers);
    if (res.success) {
      const teamToAdd = allTeams.find(ele => ele._id == selectedTeam)

      const newTeam = { ...teamToAdd, team_members: res.data }

      const members = res?.data?.map(ele => ele._id)

      setAllTeams(prev => prev.map(ele => selectedTeam ? { ...ele, team_members: res?.data } : ele))
      client.emit("assignedMembers", { newTeam, members })

      setSelectedUsers([]);
      setAllUsers([])
      setOriginalUsers([])
      setSelectedTeam(null);
      setAssignMemberForm(false);
      setDropdownIndex(null)
    }
  }

  const handleRemoveMember = async (teamId) => {
    const res = await getAllAssignedUsers(teamId)
    if (res?.success) {
      setAllUsers(res?.data ?? [])
      setOriginalUsers(res?.data ?? [])
      setSelectedTeam(teamId);
      setRemoveMemberForm(true);
    }

  };

  const showDetails = async (teamId) => {
    const res = await getTeamData(teamId)
    console.log(res);
    setSelectedTeamData(res?.data ?? {})
    setShowTeamData(res?.success || false)
  }

  const handleRemoveForm = async (e) => {
    e.preventDefault();
    console.log('Remove Member from Team:', selectedTeam);
    const res = await removeMemberToTeam(selectedTeam, selectedUsers);
    if (res?.success) {
      console.log('Member removed successfully:', res?.data);
      client.emit("removedFromTeam", { teamId: selectedTeam, members: res?.data?.members })
      setRemoveMemberForm(false);
      setSelectedUsers([])
      setDropdownIndex(null);
      setAllUsers([])

    }
  }

  return (
    <div className="relative flex flex-col space-y-4 w-full">
      {isProjectOwner && <div className="flex justify-end">
        <button
          onClick={() => setAddTeamForm(!addTeamForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-transform"
        >
          + Add Team
        </button>
      </div>}

      {addTeamForm && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          {document.body.classList.add("overflow-hidden")}
          <form
            onSubmit={handleAddTeam}
            className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-5 border border-gray-700 custom-scrollbar"
          >
            <h2 className="text-2xl font-bold text-center text-white mb-4 border-b border-gray-600 pb-2">
              Add New Team
            </h2>

            <input
              type="text"
              placeholder="Team Name"
              value={teamName}
              autoFocus
              onChange={(e) => setTeamName(e.target.value)}
              className="p-3 rounded-lg w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <div className="flex justify-end space-x-3 pt-2 border-t border-gray-700 mt-6">
              <button
                type="button"
                onClick={() => {
                  setAddTeamForm(false);
                  document.body.classList.remove("overflow-hidden");
                  setTeamName('');
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {assignMemberForm && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-lg flex justify-center items-center px-4 py-10 overflow-y-auto">
          {document.body.classList.add("overflow-hidden")}
          <form
            onSubmit={handleAssignForm}
            className="w-full max-w-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-700 rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] p-8 space-y-6 transition-all duration-300 custom-scrollbar overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white tracking-tight border-b pb-4 border-zinc-300 dark:border-zinc-700">
              Assign Members
            </h2>

            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search users..."
              className="w-full p-3 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />

            <div className="space-y-4 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {allUsers.map((user) => (
                <label
                  key={user._id}
                  htmlFor={user._id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  <span className="text-zinc-800 dark:text-zinc-200">{user.username}</span>
                  <input
                    type="checkbox"
                    id={user._id}
                    name={user._id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers((prev) => [...prev, user._id]);
                      } else {
                        setSelectedUsers((prev) =>
                          prev.filter((id) => id !== user._id)
                        );
                      }
                    }}
                    className="accent-indigo-600 w-5 h-5 rounded focus:ring-2 focus:ring-indigo-400 transition"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-300 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => {
                  setAssignMemberForm(false);
                  setDropdownIndex(null);
                  setSelectedUsers([]);
                  setSelectedTeam(null);
                  setSearchText("")
                  document.body.classList.remove("overflow-hidden");
                }}
                className="px-5 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Assign
              </button>
            </div>
          </form>
        </div>
      )}


      {removeMemberForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
          <form
            onSubmit={handleRemoveForm}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 w-[90%] max-w-md max-h-[90vh] overflow-y-auto space-y-6 border border-zinc-200 dark:border-zinc-700"
          >

            <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-white mb-6 tracking-tight">
              Remove Members to Team
            </h2>

            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            />


            <div className="space-y-4">
              {allUsers.map((user) => (
                <div key={user._id} className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    id={user._id}
                    name={user._id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers((prev) => [...prev, user._id]);
                      } else {
                        setSelectedUsers((prev) =>
                          prev.filter((id) => id !== user._id)
                        );
                      }
                    }}
                    className="accent-indigo-600 w-5 h-5 rounded focus:ring-2 focus:ring-indigo-400 transition"
                  />
                  <label
                    htmlFor={user._id}
                    className="text-zinc-700 dark:text-zinc-300 text-base font-medium"
                  >
                    {user.username}
                  </label>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-6 border-t border-zinc-300 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => {
                  setRemoveMemberForm(false);
                  setDropdownIndex(null);
                  setSelectedUsers([]);
                  setSelectedTeam(null);
                }}
                className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Remove Members
              </button>
            </div>
          </form>
        </div>
      )}



      {showTeamData && (
        <TeamList teams={selectedTeamData} onClose={() => setShowTeamData(false)} />
      )}



      <div className="w-full ">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allTeams.length > 0 && allTeams.map((team, index) => (
            <div
              key={index}
              className="relative bg-gray-800 hover:bg-gray-700 border border-gray-700 p-5 rounded-2xl text-white shadow-xl transition-transform transform hover:-translate-y-1 hover:shadow-2xl"
            >
              {isProjectOwner && <div className="absolute top-3 right-3">
                <button
                  className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                  onClick={() => setDropdownIndex(dropdownIndex === index ? null : index)}
                >
                  <FaEllipsisV className="text-gray-400 hover:text-white text-sm" />
                </button>

                {dropdownIndex === index && (
                  <div className="absolute right-0 top-10 w-44 z-30 rounded-xl shadow-xl border border-gray-700 bg-[#1e1e2e] overflow-hidden backdrop-blur-sm transition-all duration-300">
                    <button
                      onClick={() => handleAssignMember(team._id)}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-white hover:bg-[#313244] transition-colors"
                    >
                      Assign Member
                    </button>
                    <button
                      onClick={() => handleRemoveMember(team._id)}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-yellow-400 hover:bg-[#443c25] hover:text-yellow-300 transition-colors"
                    >
                      Remove Member
                    </button>
                    <button
                      onClick={() => handleDelete(team._id)}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-[#3b2a2a] hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>}

              <div className="mt-6 space-y-2">
                <h3
                  className="text-lg font-bold cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => showDetails(team._id)}
                >
                  {team.name}
                </h3>

                {/* Add more team info if needed */}
                <p className="text-sm text-gray-400 italic">Click for details</p>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

export default Team;
