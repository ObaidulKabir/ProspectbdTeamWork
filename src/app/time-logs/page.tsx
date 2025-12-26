"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { TimeLog } from "@/types/schema";

export default function TimeLogsPage() {
  const { timeLogs, projects, currentUser, logTime } = useAppStore();
  const [selectedProject, setSelectedProject] = useState("");
  const [hours, setHours] = useState(0);
  const [description, setDescription] = useState("");

  const myLogs = timeLogs.filter((log) => log.userId === currentUser?.id);

  const handleLogTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedProject) return;

    const newLog: TimeLog = {
      id: `l${Date.now()}`,
      userId: currentUser.id,
      projectId: selectedProject,
      date: new Date().toISOString(),
      hours: Number(hours),
      description,
    };

    logTime(newLog);
    setHours(0);
    setDescription("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Time Tracking
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Log Time
          </h3>
          <form onSubmit={handleLogTime} className="mt-5 grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project
              </label>
              <select
                required
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select a project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hours
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="sm:col-span-6">
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Time Log
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Recent Logs
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {myLogs.length === 0 ? (
              <li className="px-4 py-4 text-sm text-gray-500">No logs found.</li>
            ) : (
              myLogs.map((log) => (
                <li key={log.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-blue-600 truncate">
                      {projects.find((p) => p.id === log.projectId)?.name || "Unknown Project"}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {log.hours} hrs
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {log.description}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>{new Date(log.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
