"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Project } from "@/types/schema";

export default function ProjectsPage() {
  const { projects, currentUser, addProject, updateProject, teams, modules, addModule, updateModule, deleteModule } = useAppStore();
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  // Edit State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTab, setEditTab] = useState<'details' | 'modules'>('details');
  const [isAddingModuleModal, setIsAddingModuleModal] = useState(false);
  const [newModuleNameModal, setNewModuleNameModal] = useState("");
  const [newModuleDescriptionModal, setNewModuleDescriptionModal] = useState("");
  const [newModuleSubTeamModal, setNewModuleSubTeamModal] = useState("");
  const [editingModuleIdModal, setEditingModuleIdModal] = useState<string | null>(null);
  const [editModuleNameModal, setEditModuleNameModal] = useState("");
  const [editModuleDescriptionModal, setEditModuleDescriptionModal] = useState("");
  const [editModuleSubTeamModal, setEditModuleSubTeamModal] = useState("");

  const canCreateProject =
    currentUser?.role === "Admin" || currentUser?.role === "Manager";

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newProject: Project = {
      id: `p${Date.now()}`,
      name: newProjectName,
      description: newProjectDescription,
      managerId: currentUser.id,
      teamLeadId: "",
      teamMemberIds: [],
      status: "Planning",
      startDate: new Date().toISOString().split("T")[0],
      assignedTeamId: selectedTeamId || null,
    };

    addProject(newProject);
    setNewProjectName("");
    setNewProjectDescription("");
    setSelectedTeamId("");
    setShowNewProjectForm(false);
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    updateProject(editingProject.id, editingProject);
    setEditingProject(null);
    setIsAddingModuleModal(false);
    setEditingModuleIdModal(null);
  };

  const projectModulesForEdit = editingProject ? modules.filter(m => m.projectId === editingProject.id) : [];
  const availableSubTeamsForEdit = editingProject?.assignedTeamId
    ? (teams.find(t => t.id === editingProject.assignedTeamId)?.subTeams || [])
    : [];

  const handleAddModuleInModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !newModuleNameModal.trim()) return;
    addModule({
      id: `mod-${Date.now()}`,
      projectId: editingProject.id,
      name: newModuleNameModal,
      description: newModuleDescriptionModal,
      assignedSubTeamId: newModuleSubTeamModal || null,
      status: "Active",
    } as any);
    setIsAddingModuleModal(false);
    setNewModuleNameModal("");
    setNewModuleDescriptionModal("");
    setNewModuleSubTeamModal("");
  };

  const handleSaveModuleInModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModuleIdModal || !editModuleNameModal.trim()) return;
    updateModule(editingModuleIdModal, {
      name: editModuleNameModal,
      description: editModuleDescriptionModal,
      assignedSubTeamId: editModuleSubTeamModal || null,
    });
    setEditingModuleIdModal(null);
  };

  const handleDeleteModuleInModal = (moduleId: string) => {
    if (confirm("Are you sure you want to delete this module?")) {
      deleteModule(moduleId);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Project</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditTab('details')}
                  className={`text-xs px-3 py-1 rounded ${editTab === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  Details
                </button>
                <button
                  onClick={() => setEditTab('modules')}
                  className={`text-xs px-3 py-1 rounded ${editTab === 'modules' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  Modules
                </button>
              </div>
            </div>

            {editTab === 'details' ? (
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assign to Team
                  </label>
                  <select
                    value={editingProject.assignedTeamId || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, assignedTeamId: e.target.value || null })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                  >
                    <option value="">No Team Assigned</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Project Modules</h3>
                  <button
                    onClick={() => setIsAddingModuleModal(!isAddingModuleModal)}
                    className="text-xs px-3 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {isAddingModuleModal ? "Cancel" : "Add Module"}
                  </button>
                </div>
                {isAddingModuleModal && (
                  <form onSubmit={handleAddModuleInModal} className="space-y-3 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    <input
                      type="text"
                      placeholder="Module name"
                      required
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                      value={newModuleNameModal}
                      onChange={(e) => setNewModuleNameModal(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                      value={newModuleDescriptionModal}
                      onChange={(e) => setNewModuleDescriptionModal(e.target.value)}
                    />
                    <select
                      value={newModuleSubTeamModal}
                      onChange={(e) => setNewModuleSubTeamModal(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                    >
                      <option value="">No Sub-Team</option>
                      {availableSubTeamsForEdit.map(st => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                    <div className="flex justify-end">
                      <button type="submit" className="text-xs px-3 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700">Create Module</button>
                    </div>
                  </form>
                )}
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700">
                  {projectModulesForEdit.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-gray-500">No modules yet.</li>
                  ) : (
                    projectModulesForEdit.map(m => (
                      <li key={m.id} className="px-3 py-2 flex items-center justify-between">
                        {editingModuleIdModal === m.id ? (
                          <form onSubmit={handleSaveModuleInModal} className="flex-1 flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1"
                              value={editModuleNameModal}
                              onChange={(e) => setEditModuleNameModal(e.target.value)}
                            />
                            <input
                              type="text"
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1"
                              value={editModuleDescriptionModal}
                              onChange={(e) => setEditModuleDescriptionModal(e.target.value)}
                            />
                            <select
                              value={editModuleSubTeamModal}
                              onChange={(e) => setEditModuleSubTeamModal(e.target.value)}
                              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1 text-xs"
                            >
                              <option value="">No Sub-Team</option>
                              {availableSubTeamsForEdit.map(st => (
                                <option key={st.id} value={st.id}>{st.name}</option>
                              ))}
                            </select>
                            <button type="submit" className="text-xs px-2 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700">Save</button>
                            <button type="button" onClick={() => setEditingModuleIdModal(null)} className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200">Cancel</button>
                          </form>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="text-sm text-gray-900 dark:text-white">{m.name}</div>
                              <div className="text-xs text-gray-500">{m.description}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {m.assignedSubTeamId && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                                  {availableSubTeamsForEdit.find(st => st.id === m.assignedSubTeamId)?.name || "Sub-Team"}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingModuleIdModal(m.id);
                                  setEditModuleNameModal(m.name);
                                  setEditModuleDescriptionModal(m.description);
                                  setEditModuleSubTeamModal(m.assignedSubTeamId || "");
                                }}
                                className="text-xs text-gray-500 hover:text-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteModuleInModal(m.id)}
                                className="text-xs text-gray-500 hover:text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Projects
        </h1>
        {canCreateProject && !editingProject && (
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assign to Team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">No Team Assigned</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow h-full flex flex-col relative">
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingProject({ ...project });
                  }}
                  className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Edit Project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start pr-6">
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
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Started: {project.startDate}</span>
                  {project.assignedTeamId && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {teams.find((t) => t.id === project.assignedTeamId)?.name || "Unknown Team"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
