"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Project } from "@/types/schema";

export default function ProjectsPage() {
  const { projects, currentUser, addProject } = useAppStore();
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const canCreateProject =
    currentUser?.role === "Admin" || currentUser?.role === "Manager";

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newProject: Project = {
      id: `p${Date.now()}`,
      name: newProjectName,
      description: "New project created",
      managerId: currentUser.id,
      teamLeadId: "",
      teamMemberIds: [],
      status: "Planning",
      startDate: new Date().toISOString().split("T")[0],
    };

    addProject(newProject);
    setNewProjectName("");
    setShowNewProjectForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Projects
        </h1>
        {canCreateProject && (
          <button
            onClick={() => setShowNewProjectForm(!showNewProjectForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {showNewProjectForm ? "Cancel" : "New Project"}
          </button>
        )}
      </div>

      {showNewProjectForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Name
              </label>
              <input
                type="text"
                required
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Project
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            href={`/projects/${project.id}`}
            key={project.id}
            className="block group"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600">
                    {project.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <span>Started: {project.startDate}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
