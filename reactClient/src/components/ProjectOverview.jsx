import React from 'react';
import { useLoaderData, useParams, useNavigate } from 'react-router-dom';
import { FaTasks, FaCheckCircle, FaUsers, FaLayerGroup } from 'react-icons/fa';

function ProjectOverview() {
  const data = useLoaderData()?.data;
  const { projectId } = useParams();
  const navigate = useNavigate(); // 🧭 Initialize navigator

  const totalTasks = data?.totalTasks || 0;
  const completedTasks = data?.completedTasks || 0;
  const totalMembers = data?.totalMembers || 0;
  const totalTeams = data?.totalTeams || 0;

  // Add 'to' property for navigation
  const cards = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: <FaTasks className="text-blue-400 text-4xl" />,
      bg: 'bg-blue-900/30',
      to: `/projects/${projectId}/tasks`
    },
    {
      title: 'Completed Tasks',
      value: completedTasks,
      icon: <FaCheckCircle className="text-green-400 text-4xl" />,
      bg: 'bg-green-900/30',
      to: `/projects/${projectId}/tasks`
    },
    {
      title: 'Total Teams',
      value: totalTeams,
      icon: <FaLayerGroup className="text-purple-400 text-4xl" />,
      bg: 'bg-purple-900/30',
      to: `/projects/${projectId}/teams`
    },
    {
      title: 'Total Members',
      value: totalMembers,
      icon: <FaUsers className="text-pink-400 text-4xl" />,
      bg: 'bg-pink-900/30',
      to: `/projects/${projectId}/teams`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">📊 Project Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.to)} // 👈 Navigate on click
            className={`cursor-pointer rounded-xl shadow-md p-6 flex items-center justify-between hover:scale-105 transition-transform ${card.bg}`}
          >
            <div>
              <h2 className="text-sm font-medium text-gray-300">{card.title}</h2>
              <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
            </div>
            <div>{card.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectOverview;
