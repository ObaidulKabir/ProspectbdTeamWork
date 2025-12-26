"use client";

import { useAppStore } from "@/lib/store";
import Link from "next/link";

export default function MyTasksPage() {
  const { currentUser, tasks, projects } = useAppStore();
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser?.id);

  if (!currentUser) return <div>Please select a user.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        My Tasks
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {myTasks.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No tasks assigned to you.
            </li>
          ) : (
            myTasks.map((task) => {
              const project = projects.find((p) => task.moduleId.startsWith(p.id)) || projects[0]; // Fallback logic
              return (
                <li key={task.id}>
                  <div className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {task.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.status === "Done"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {task.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {project?.name || "Unknown Project"}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                             Skills: {task.requiredSkills.join(", ") || "None"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
