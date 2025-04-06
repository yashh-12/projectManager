import React from 'react';

function TeamList({ teams, onClose }) {
  const team = teams[0];
  if (!team) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-red-500 focus:outline-none"
        >
          &times;
        </button>

        {/* Team Name Header */}
        <h2 className="text-3xl font-extrabold mb-8 text-center border-b border-gray-700 pb-4">
          {team.name}
        </h2>

        {/* Team Members Section */}
        <div className="mb-8">
          <h3 className="text-2xl text-blue-400 font-bold mb-4">Team Members</h3>
          {/* Header Row */}
          <div className="grid grid-cols-2 gap-4 border-b border-gray-700 pb-2 mb-2">
            <span className="font-semibold">Name/Username</span>
            <span className="font-semibold">Email</span>
          </div>
          <ul className="space-y-2">
            {team.team_members?.length > 0 ? (
              team.team_members.map((member) => (
                <li
                  key={member._id}
                  className="grid grid-cols-2 gap-4 border-b border-gray-700 pb-2"
                >
                  <span className="font-semibold">
                    {member.name || member.username}
                  </span>
                  <span className="text-sm text-gray-400">{member.email}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400">No members</li>
            )}
          </ul>
        </div>

        {/* Assigned Tasks Section */}
        <div>
          <h3 className="text-2xl text-green-400 font-bold mb-4">Assigned Tasks</h3>
          {/* Header Row */}
          <div className="grid grid-cols-2 gap-4 border-b border-gray-700 pb-2 mb-2">
            <span className="font-semibold">Task Name</span>
            <span className="font-semibold">Deadline</span>
          </div>
          <ul className="space-y-2">
            {team.assigned_tasks?.length > 0 ? (
              team.assigned_tasks.map((task) => (
                <li
                  key={task._id}
                  className="grid grid-cols-2 gap-4 border-b border-gray-700 pb-2"
                >
                  <span className="font-semibold">{task.task}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-400">No tasks</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TeamList;
