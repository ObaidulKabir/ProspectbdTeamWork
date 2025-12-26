"use client";

import { useAppStore } from "@/lib/store";

export default function Dashboard() {
  const { currentUser, projects, tasks } = useAppStore();

  const myTasks = tasks.filter((t) => t.assigneeId === currentUser?.id);
  const activeProjects = projects.filter((p) => p.status !== "Deployment");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          Welcome back, <span className="font-semibold">{currentUser?.name}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Assigned Tasks
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {myTasks.length}
            </dd>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Active Projects
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {activeProjects.length}
            </dd>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Hours Logged (This Week)
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              0
            </dd>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Pending Reviews
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              0
            </dd>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            My Tasks
          </h2>
          {myTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No tasks assigned to you.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {myTasks.map((task) => (
                <li key={task.id} className="py-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {task.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Project Status */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Project Overview
          </h2>
          {activeProjects.length === 0 ? (
            <p className="text-gray-500 text-sm">No active projects.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeProjects.map((project) => (
                <li key={project.id} className="py-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">{project.description}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {project.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
