import React from 'react';

function TeamList({ teams, onClose }) {
  const team = teams[0];
  if (!team) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative transition-all duration-300 animate-fade-in custom-scrollbar">

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-red-500 transition-all duration-200"
        >
          &times;
        </button>

        <h2 className="text-4xl font-black mb-8 text-center border-b border-gray-700 pb-4 tracking-wide">
          {team.name}
        </h2>

        <section className="mb-12">
          <h3 className="text-2xl text-blue-400 font-bold mb-4 uppercase tracking-wide">
            Team Members
          </h3>
          <div className="grid grid-cols-2 gap-4 border-b border-gray-700 pb-3 mb-3 font-semibold text-gray-300 uppercase text-sm">
            <span>Name / Username</span>
            <span>Email</span>
          </div>
          <ul className="space-y-3">
            {team.team_members?.length > 0 ? (
              team.team_members.map(({ _id, name, username, email }) => (
                <li
                  key={_id}
                  className="grid grid-cols-2 gap-4 items-center border-b border-gray-700 pb-2 hover:bg-gray-800/40 px-2 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium text-white">{name || username}</span>
                  <span className="text-sm text-gray-400">{email}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400">No members</li>
            )}
          </ul>
        </section>

        <section>
          <h3 className="text-2xl text-green-400 font-bold mb-4 uppercase tracking-wide">
            Assigned Tasks
          </h3>
          <div className="grid grid-cols-2 gap-4 border-b border-gray-700 pb-3 mb-3 font-semibold text-gray-300 uppercase text-sm">
            <span>Task</span>
            <span>Deadline</span>
          </div>
          <ul className="space-y-3">
            {team.assigned_tasks?.length > 0 ? (
              team.assigned_tasks.map(({ _id, task, deadline }) => (
                <li
                  key={_id}
                  className="grid grid-cols-2 gap-4 items-center border-b border-gray-700 pb-2 hover:bg-gray-800/40 px-2 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium text-white">{task}</span>
                  <span className="text-sm text-gray-400">
                    {deadline
                      ? new Date(deadline).toLocaleDateString()
                      : 'No deadline'}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-400">No tasks</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default TeamList;
