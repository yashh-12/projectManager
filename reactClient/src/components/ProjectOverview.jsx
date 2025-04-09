import React, { useEffect } from 'react';
import { useLoaderData, useParams, useNavigate } from 'react-router-dom';
import { FaTasks, FaCheckCircle, FaUsers, FaLayerGroup } from 'react-icons/fa';
import { markProjectAsDone, markProjectAsNotDone, toggleIsCompleted } from '../services/projectService';

function ProjectOverview() {
  // const data = useLoaderData()?.data;
  const {overviewData,allTasks} = useLoaderData();
  const data = overviewData.data

  console.log("over ",allTasks);
  
  const { projectId } = useParams();
  const navigate = useNavigate();

  const totalTasks = data?.totalTasks || 0;
  const completedTasks = data?.completedTasks || 0;
  const totalMembers = data?.totalMembers || 0;
  const totalTeams = data?.totalTeams || 0;

  useEffect(() => {
    const toggleProjectStatus = async () => {
      if (completedTasks / totalTasks * 100 == 100) {
        await markProjectAsDone(projectId)
      }
      else {
        await markProjectAsNotDone(projectId)
      }
    }
    toggleProjectStatus()
  }, [])

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
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <div className="text-sm text-gray-400">
          Home / Projects / <span className="text-white font-medium">Overview</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">📊 Project Overview</h1>

      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-2">Progress</h2>
        <div className="relative w-full h-3 rounded-full bg-gray-700">
          <div
            className="h-3 rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-1 px-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.to)}
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
