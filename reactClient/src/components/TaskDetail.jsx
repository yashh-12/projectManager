import React from 'react';

function TaskDetail({ task, onClose }) {
  if (!task) return null;

  const team = task.assigned_team;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-red-500 focus:outline-none"
        >
          &times;
        </button>

        <h2 className="text-3xl font-extrabold mb-4 text-center border-b border-gray-700 pb-4">
          {task.task}
        </h2>

        <div className="mb-6">
          <p className="text-lg mb-2">
            <span className="font-semibold text-blue-400">Deadline:</span>{' '}
            {new Date(task.deadline).toLocaleString()}
          </p>
          <p className="text-lg">
            <span className="font-semibold text-blue-400">Details:</span> {task.details}
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl text-green-400 font-bold mb-4">Assigned Team</h3>
          <p className="text-lg font-semibold mb-4">{team?.name || 'Unnamed Team'}</p>

          <div className="grid grid-cols-2 gap-4 border-b border-gray-700 pb-2 mb-2">
            <span className="font-semibold">Name/Username</span>
            <span className="font-semibold">Email</span>
          </div>

          <ul className="space-y-2">
            {team?.team_members?.length > 0 ? (
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
              <li className="text-gray-400">No team members assigned</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TaskDetail;
