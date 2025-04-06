import React, { useState, useEffect } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import { assignMemberToTeam, createTeam, deleteTeam, getAllAssignedUsers, getTeamData, removeMemberToTeam } from '../services/teamService.js';
import { useDispatch } from 'react-redux';
import { setLoaderTrue, setLoaderFalse } from '../store/uiSlice.js';
import { FaEllipsisV } from 'react-icons/fa';
import { getAllTeams } from '../services/projectService.js';
import { getAllUser } from '../services/authService.js';
import { getUnassignedUsers } from '../services/teamService.js';
import TeamList from './TeamList.jsx';

function Team() {
  const dispatch = useDispatch();
  const [addTeamForm, setAddTeamForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const { projectId } = useParams();
  const aTeams = useLoaderData();
  // console.log(allTeams);
  const [assignMemberForm, setAssignMemberForm] = useState(false);
  const [removeMemberForm, setRemoveMemberForm] = useState(false);

  const [allTeams, setAllTeams] = useState(aTeams?.data || []);
  const [isThereLoaderData, setIsThereLoaderData] = useState(true)
  const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamData, setShowTeamData] = useState(false);
  const [selectedTeamData, setSelectedTeamData] = useState({})
  const [searchText, setSearchText] = useState("")
  const [originalUsers, setOriginalUsers] = useState([])

  useEffect(() => {
    setAllUsers(originalUsers.filter(user => user.name.toLowerCase().includes(searchText.toLowerCase() || '')))
  }, [searchText])

  const handleAddTeam = async (e) => {
    e.preventDefault();
    console.log('Team Added:', { teamName, projectId });
    const res = await createTeam(projectId, teamName);
    if (res.success) {
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
    console.log(res);

    if (res.success) {
      setAllTeams(allTeams.filter(team => team._id !== teamId));
    }

  };

  const handleAssignMember = async (teamId) => {
    console.log('Assign Member to Team:', teamId);
    const res = await getUnassignedUsers(teamId);
    console.log(res);

    if (res.success) {
      setAllUsers(res.data ?? []);
      setOriginalUsers(res.data ?? [])
      setSelectedTeam(teamId);
      setAssignMemberForm(true);
    }

  };

  const handleAssignForm = async (e) => {
    e.preventDefault();
    console.log(selectedUsers);
    const res = await assignMemberToTeam(selectedTeam, selectedUsers);
    console.log(res);

    setSelectedUsers([]);
    setAllUsers([])
    setOriginalUsers([])
    setSelectedTeam(null);
    setAssignMemberForm(false);
    setDropdownIndex(null)
  }

  const handleRemoveMember = async (teamId) => {
    console.log('Remove Member from Team:', teamId);
    const res = await getAllAssignedUsers(teamId)
    if (res.success) {
      setAllUsers(res.data ?? [])
      setOriginalUsers(res.data ?? [])
      setSelectedTeam(teamId);
      setRemoveMemberForm(true);
    }
    console.log(res);

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
    if (res.success) {
      console.log('Member removed successfully:', res.data);
      setRemoveMemberForm(false);
      setDropdownIndex(null);
      setAllUsers([])
      
    }
  }

  return (
    <div className="relative flex flex-col space-y-4 w-full">
      <div className="flex justify-end">
        <button
          onClick={() => setAddTeamForm(!addTeamForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-transform"
        >
          + Add Team
        </button>
      </div>

      {addTeamForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-10">
          <form onSubmit={handleAddTeam} className="bg-gray-800 p-6 rounded-lg shadow-xl w-96 space-y-4">
            <h2 className="text-xl font-semibold text-white">Add New Team</h2>
            <input
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="p-3 border rounded-lg bg-gray-700 text-white w-full"
            />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setAddTeamForm(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Submit Team
              </button>
            </div>
          </form>
        </div>
      )}

      {assignMemberForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
          <form
            onSubmit={handleAssignForm}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 w-[90%] max-w-md max-h-[90vh] overflow-y-auto space-y-6 border border-zinc-200 dark:border-zinc-700"
          >

            <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-white mb-6 tracking-tight">
              Assign Members to Team
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
                  setAssignMemberForm(false);
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
                Assign Members
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



      <div className="w-full bg-gray-800 p-6 rounded-lg">
        <div className="grid grid-cols-2 gap-4 p-4 font-semibold bg-gray-700 rounded-lg mb-4">
          <div>Team Name</div>
          <div>Actions</div>
        </div>

        <div className="space-y-4">
          {allTeams.length > 0 && allTeams.map((team, index) => (
            <div key={index} className="border border-gray-700 p-4 rounded-lg flex items-center relative">
              <div className="flex-1">
                <h3 className="text-lg font-medium" onClick={() => showDetails(team._id)} >{team.name}</h3>
              </div>

              <button
                className="ml-4 p-2 text-gray-400 hover:text-white"
                onClick={() => setDropdownIndex(dropdownIndex === index ? null : index)}
              >
                <FaEllipsisV />
              </button>

              {dropdownIndex === index && (
                <div className="absolute top-10 right-0 bg-gray-700 rounded-lg shadow-lg w-40 z-10">
                  <button
                    onClick={() => handleAssignMember(team._id)}
                    className="block w-full px-4 py-2 text-white hover:bg-gray-600"
                  >
                    Assign Member
                  </button>
                  <button
                    onClick={() => handleRemoveMember(team._id)}
                    className="block w-full px-4 py-2 text-yellow-500 hover:bg-gray-600"
                  >
                    Remove Member
                  </button>
                  <button
                    onClick={() => handleDelete(team._id)}
                    className="block w-full px-4 py-2 text-red-500 hover:bg-gray-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Team;
