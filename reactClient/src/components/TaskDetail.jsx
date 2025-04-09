import React from 'react';

function TaskDetail({ task, onClose }) {
  if (!task) return null;

  const team = task.assigned_team;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1e1e2e]/90 text-white p-8 shadow-2xl backdrop-blur-xl scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent transform scale-95 animate-scale-in">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-red-500 transition duration-200"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-4xl font-extrabold mb-6 text-center border-b border-gray-700 pb-4 tracking-wide">
          {task.task}
        </h2>

        {/* Deadline & Details */}
        <div className="mb-8 space-y-4 text-[17px] leading-relaxed">
          <p>
            <span className="font-semibold text-blue-400">📅 Deadline:</span>{' '}
            {new Date(task.deadline).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold text-blue-400">📝 Details:</span>{' '}
            {task.details}
          </p>
        </div>

        {/* Assigned Team Section */}
        <div className="mb-6">
          <h3 className="text-2xl text-green-400 font-bold mb-2">Assigned Team</h3>
          <p className="text-lg font-semibold mb-8 text-white/80">
            {team?.name || 'No team assigned'}
          </p>
          
          <h3 className="text-2xl text-green-400 font-bold mb-2">Assigned Members</h3>

          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-400 uppercase border-b border-gray-600 pb-2">
            
            <span>Name / Username</span>
            <span>Email</span>
          </div>

          <ul className="space-y-2 mt-2">
            {team?.team_members?.length > 0 ? (
              team.team_members.map((member) => (
                <li
                  key={member._id}
                  className="grid grid-cols-2 gap-4 py-2 px-3 rounded-md bg-gray-800/80 hover:bg-gray-700/80 transition duration-150"
                >
                  <span className="text-white font-medium">{member.name || member.username}</span>
                  <span className="text-sm text-gray-400">{member.email}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400 mt-2">No team members assigned</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TaskDetail;
