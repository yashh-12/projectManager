import React from 'react';
import { useLoaderData } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

function Overview() {
  const { stats, chartData } = useLoaderData().data;

  console.log(useLoaderData().data);
  
  const cards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      bg: 'bg-blue-900/30',
      color: 'text-blue-400',
    },
    {
      title: 'Completed Projects',
      value: stats.completedProjects,
      bg: 'bg-green-900/30',
      color: 'text-green-400',
    },
    {
      title: 'In Progress',
      value: stats.totalProjects - stats.completedProjects,
      bg: 'bg-yellow-900/30',
      color: 'text-yellow-400',
    },
    {
      title: 'Avg Completion',
      value: chartData.length
        ? `${Math.round(chartData.reduce((a, b) => a + b.completion, 0) / chartData.length)}%`
        : '0%',
      bg: 'bg-purple-900/30',
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <div className="text-sm text-gray-400">
            Home / <span className="text-white font-medium">Dashboard</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`rounded-xl shadow-md p-6 flex items-center justify-between hover:scale-105 transition-transform cursor-pointer ${card.bg}`}
            >
              <div>
                <h2 className="text-sm font-medium text-gray-300">{card.title}</h2>
                <p className={`text-3xl font-bold text-white mt-1 ${card.color}`}>
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-[400px] bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Project Completion Chart</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#334155" />
              <XAxis
                dataKey="name"
                angle={-15}
                textAnchor="end"
                interval={0}
                stroke="#e2e8f0"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
                tickLine={{ stroke: '#475569' }}
              />
              <YAxis
                stroke="#e2e8f0"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
                tickLine={{ stroke: '#475569' }}
                domain={[0, 100]}
                tickFormatter={(tick) => `${tick}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                }}
                labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                formatter={(value) => `${value}%`}
                cursor={{ fill: '#475569', opacity: 0.3 }}
              />
              <Bar
                dataKey="completion"
                fill="#89b4fa"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Overview;
