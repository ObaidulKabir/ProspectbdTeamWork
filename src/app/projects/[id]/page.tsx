"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Task, TaskStatus } from "@/types/schema";
import { GitIntegration } from "@/components/GitIntegration";
import { TimeTracker } from "@/components/TimeTracker";
import { TimeReports } from "@/components/TimeReports";

const COLUMNS: TaskStatus[] = ["Backlog", "ToDo", "InProgress", "Review", "Done"];

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { projects, tasks, addTask, updateTaskStatus, updateTaskAssignee, currentUser, modules, users, addModule, updateModule, deleteModule, userStories, addUserStory, updateUserStory, deleteUserStory, deleteTask, sprints, addSprint, updateSprint, updateTask, auditLogs } = useAppStore();
  const [activeTab, setActiveTab] = useState<'kanban' | 'git' | 'structure' | 'analytics'>('kanban');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [activeModuleId, setActiveModuleId] = useState<string>('all');
  const [activeSprintId, setActiveSprintId] = useState<string>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Module Management State
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [newModuleSubTeam, setNewModuleSubTeam] = useState("");
  
  // Edit Module State
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleName, setEditModuleName] = useState("");
  const [editModuleDescription, setEditModuleDescription] = useState("");
  const [editModuleSubTeam, setEditModuleSubTeam] = useState("");

  // User Story Management State
  const [isAddingStory, setIsAddingStory] = useState<string | null>(null); // moduleId
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryPoints, setNewStoryPoints] = useState(1);
  
  // Edit User Story State
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [editStoryTitle, setEditStoryTitle] = useState("");
  const [editStoryPoints, setEditStoryPoints] = useState(1);

  // Task Management State (in Structure View)
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null); // userStoryId
  const [newTaskTitleStruct, setNewTaskTitleStruct] = useState("");
  const [expandedStories, setExpandedStories] = useState<string[]>([]); // storyIds
  
  // Sprint Management State
  const [isAddingSprint, setIsAddingSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [newSprintStart, setNewSprintStart] = useState("");
  const [newSprintEnd, setNewSprintEnd] = useState("");
  const [newSprintGoal, setNewSprintGoal] = useState("");
  const [newSprintStatus, setNewSprintStatus] = useState<'Planned' | 'Active' | 'Completed'>('Planned');
  const [addingModuleSprintFor, setAddingModuleSprintFor] = useState<string | null>(null);
  const [newModuleSprintName, setNewModuleSprintName] = useState("");
  const [newModuleSprintStart, setNewModuleSprintStart] = useState("");
  const [newModuleSprintEnd, setNewModuleSprintEnd] = useState("");
  const [newModuleSprintGoal, setNewModuleSprintGoal] = useState("");
  const [newModuleSprintStatus, setNewModuleSprintStatus] = useState<'Planned' | 'Active' | 'Completed'>('Planned');
  const [newModuleParentSprintId, setNewModuleParentSprintId] = useState<string>("");

  const project = projects.find((p) => p.id === projectId);
  const projectModules = modules.filter((m) => m.projectId === projectId);
  const projectModuleIds = projectModules.map(m => m.id);
  const projectSprints = sprints.filter(s => s.projectId === projectId);
  const getModuleSprints = (moduleId: string) => sprints.filter(s => s.projectId === projectId && s.moduleId === moduleId);
  const getSprintProgress = (sprintId: string) => {
    const sprintStories = userStories.filter(us => us.sprintId === sprintId);
    const sprintTasks = tasks.filter(t => {
      if (t.userStoryId) {
        const st = userStories.find(s => s.id === t.userStoryId);
        return st && st.sprintId === sprintId;
      }
      return t.sprintId === sprintId;
    });
    const doneTasks = sprintTasks.filter(t => t.status === 'Done').length;
    return {
      storyCount: sprintStories.length,
      taskCount: sprintTasks.length,
      doneTaskCount: doneTasks,
    };
  };
  
  const relevantTasks = tasks.filter(t => {
    const isProjectTask = projectModuleIds.includes(t.moduleId) || t.moduleId === projectId;
    if (!isProjectTask) return false;
    if (filterAssignee !== 'all') {
      if (filterAssignee === 'unassigned' && t.assigneeId) return false;
      if (filterAssignee !== 'unassigned' && t.assigneeId !== filterAssignee) return false;
    }
    if (activeModuleId !== 'all') {
      const moduleStoryIds = userStories.filter(s => s.moduleId === activeModuleId).map(s => s.id);
      const moduleSprintIds = sprints.filter(sp => sp.projectId === projectId && sp.moduleId === activeModuleId).map(sp => sp.id);
      const belongsToModule =
        t.moduleId === activeModuleId ||
        (t.userStoryId && moduleStoryIds.includes(t.userStoryId)) ||
        (t.sprintId && moduleSprintIds.includes(t.sprintId));
      if (!belongsToModule) return false;
    }
    if (activeSprintId !== 'all') {
      const us = t.userStoryId ? userStories.find(s => s.id === t.userStoryId) : null;
      const taskInSprint = (t.sprintId === activeSprintId) || (us?.sprintId === activeSprintId);
      if (!taskInSprint) return false;
    }
    return true;
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(project ? { ...project } : null);
  const { updateProject, teams } = useAppStore();

  if (!project || !editForm) {
    return <div>Project not found</div>;
  }

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    const newModule: any = { // Using any temporarily
      id: `mod-${Date.now()}`,
      projectId: projectId,
      name: newModuleName,
      description: newModuleDescription,
      assignedSubTeamId: newModuleSubTeam || null,
      status: "Active",
    };

    addModule(newModule);
    setIsAddingModule(false);
    setNewModuleName("");
    setNewModuleDescription("");
    setNewModuleSubTeam("");
  };

  const projectTeam = teams.find(t => t.id === project.assignedTeamId);
  const availableSubTeams = projectTeam?.subTeams || [];

  const handleEditModule = (module: any) => {
    setEditingModuleId(module.id);
    setEditModuleName(module.name);
    setEditModuleDescription(module.description);
    setEditModuleSubTeam(module.assignedSubTeamId || "");
  };

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModuleId || !editModuleName.trim()) return;

    updateModule(editingModuleId, {
      name: editModuleName,
      description: editModuleDescription,
      assignedSubTeamId: editModuleSubTeam || null,
    });

    setEditingModuleId(null);
  };

  const handleDeleteModule = (moduleId: string) => {
    if (confirm("Are you sure you want to delete this module?")) {
      deleteModule(moduleId);
    }
  };

  const handleAddUserStory = (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;

    const newStory: any = { // Using any temporarily
      id: `us-${Date.now()}`,
      moduleId: moduleId,
      title: newStoryTitle,
      description: "",
      priority: "Medium",
      status: "Backlog",
      points: newStoryPoints,
    };

    addUserStory(newStory);
    setIsAddingStory(null);
    setNewStoryTitle("");
    setNewStoryPoints(1);
  };

  const handleUpdateUserStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStoryId || !editStoryTitle.trim()) return;

    updateUserStory(editingStoryId, {
      title: editStoryTitle,
      points: editStoryPoints,
    });

    setEditingStoryId(null);
  };

  const handleDeleteUserStory = (storyId: string) => {
    if (confirm("Are you sure you want to delete this user story?")) {
      deleteUserStory(storyId);
    }
  };

  const handleAddTaskToStory = (e: React.FormEvent, userStoryId: string, moduleId: string) => {
    e.preventDefault();
    if (!newTaskTitleStruct.trim()) return;

    const newTask: Task = {
      id: `t${Date.now()}`,
      moduleId: moduleId, // Keep for backward compatibility
      userStoryId: userStoryId,
      taskLevel: 'UserStory',
      title: newTaskTitleStruct,
      description: "",
      status: "ToDo",
      requiredSkills: [],
      estimatedHours: 0,
      assigneeId: undefined
    };

    addTask(newTask);
    setIsAddingTask(null);
    setNewTaskTitleStruct("");
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };
  
  const handleAddSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim() || !project) return;
    addSprint({
      id: `sp-${Date.now()}`,
      projectId,
      moduleId: null,
      scope: 'Project',
      name: newSprintName,
      startDate: newSprintStart || new Date().toISOString().split('T')[0],
      endDate: newSprintEnd || new Date().toISOString().split('T')[0],
      status: newSprintStatus,
      goal: newSprintGoal,
    });
    setIsAddingSprint(false);
    setNewSprintName("");
    setNewSprintStart("");
    setNewSprintEnd("");
    setNewSprintGoal("");
    setNewSprintStatus('Planned');
  };
  const handleAddModuleSprint = (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!newModuleSprintName.trim()) return;
    const parent = projectSprints.find(sp => sp.moduleId === null && sp.id === newModuleParentSprintId);
    if (!parent) return;
    const start = newModuleSprintStart || new Date().toISOString().split('T')[0];
    const end = newModuleSprintEnd || new Date().toISOString().split('T')[0];
    if (start < parent.startDate || end > parent.endDate) return;
    addSprint({
      id: `sp-${Date.now()}`,
      projectId,
      moduleId,
      scope: 'Module',
      name: newModuleSprintName,
      startDate: start,
      endDate: end,
      status: newModuleSprintStatus,
      goal: newModuleSprintGoal,
      parentProjectSprintId: parent.id,
    });
    setAddingModuleSprintFor(null);
    setNewModuleSprintName("");
    setNewModuleSprintStart("");
    setNewModuleSprintEnd("");
    setNewModuleSprintGoal("");
    setNewModuleSprintStatus('Planned');
    setNewModuleParentSprintId("");
  };

  const toggleStoryExpand = (storyId: string) => {
    if (expandedStories.includes(storyId)) {
      setExpandedStories(expandedStories.filter(id => id !== storyId));
    } else {
      setExpandedStories([...expandedStories, storyId]);
    }
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name) return;

    updateProject(projectId, editForm);
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskStatus(taskId, status);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const newTask: Task = {
      id: `t${Date.now()}`,
      moduleId: projectId,
      taskLevel: 'Project',
      title: newTaskTitle,
      description: "",
      status: "Backlog",
      requiredSkills: [],
      estimatedHours: 0,
      assigneeId: currentUser?.id
    };

    addTask(newTask);
    setNewTaskTitle("");
  };
  
  const toggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };
  const clearSelection = () => {
    setSelectedTaskIds([]);
  };
  const bulkChangeStatus = (status: TaskStatus) => {
    selectedTaskIds.forEach((id) => updateTaskStatus(id, status));
  };
  const bulkChangeAssignee = (assigneeId: string | undefined) => {
    selectedTaskIds.forEach((id) => updateTaskAssignee(id, assigneeId));
  };
  const bulkChangeSprint = (sprintId: string | null) => {
    selectedTaskIds.forEach((id) => updateTask(id, { sprintId }));
  };
  const moveTaskToModule = (task: Task, targetModuleId: string) => {
    const updates: any = { moduleId: targetModuleId, userStoryId: undefined };
    if (task.sprintId) {
      const sp = sprints.find(s => s.id === task.sprintId);
      if (sp && sp.scope === 'Module' && sp.moduleId !== targetModuleId) {
        updates.sprintId = null;
      }
    }
    updateTask(task.id, updates);
  };
  const moveTaskToStory = (task: Task, storyId: string) => {
    const story = userStories.find(s => s.id === storyId);
    if (!story) return;
    const updates: any = { moduleId: story.moduleId, userStoryId: storyId };
    if (task.sprintId) {
      const sp = sprints.find(s => s.id === task.sprintId);
      if (sp && sp.scope === 'Module' && sp.moduleId !== story.moduleId) {
        updates.sprintId = null;
      }
    }
    updateTask(task.id, updates);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Edit Project Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Project</h2>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assigned Team
                </label>
                <select
                  value={editForm.assignedTeamId || ""}
                  onChange={(e) => setEditForm({ ...editForm, assignedTeamId: e.target.value || null })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                >
                  <option value="">No Team Assigned</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Modules</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingModule(!isAddingModule)}
                    className="text-xs px-2 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {isAddingModule ? "Cancel" : "Add Module"}
                  </button>
                </div>
                {isAddingModule && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md mb-3">
                    <form onSubmit={handleAddModule} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Module name"
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                        value={newModuleName}
                        onChange={(e) => setNewModuleName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                        value={newModuleDescription}
                        onChange={(e) => setNewModuleDescription(e.target.value)}
                      />
                      <select
                        value={newModuleSubTeam}
                        onChange={(e) => setNewModuleSubTeam(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                      >
                        <option value="">No Sub-Team</option>
                        {availableSubTeams.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700 text-xs font-medium"
                        >
                          Create Module
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700">
                  {projectModules.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-gray-500">No modules yet.</li>
                  ) : (
                    projectModules.map((m) => (
                      <li key={m.id} className="px-3 py-2 flex items-center justify-between">
                        {editingModuleId === m.id ? (
                          <form onSubmit={handleSaveModule} className="flex-1 flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1"
                              value={editModuleName}
                              onChange={(e) => setEditModuleName(e.target.value)}
                            />
                            <input
                              type="text"
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1"
                              value={editModuleDescription}
                              onChange={(e) => setEditModuleDescription(e.target.value)}
                            />
                            <select
                              value={editModuleSubTeam}
                              onChange={(e) => setEditModuleSubTeam(e.target.value)}
                              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1 text-xs"
                            >
                              <option value="">No Sub-Team</option>
                              {availableSubTeams.map(st => (
                                <option key={st.id} value={st.id}>{st.name}</option>
                              ))}
                            </select>
                            <button type="submit" className="text-xs px-2 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700">Save</button>
                            <button type="button" onClick={() => setEditingModuleId(null)} className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200">Cancel</button>
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
                                  {availableSubTeams.find(st => st.id === m.assignedSubTeamId)?.name || "Sub-Team"}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingModuleId(m.id);
                                  setEditModuleName(m.name);
                                  setEditModuleDescription(m.description);
                                  setEditModuleSubTeam(m.assignedSubTeamId || "");
                                }}
                                className="text-xs text-gray-500 hover:text-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteModule(m.id)}
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
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="Edit Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('kanban')}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    activeTab === 'kanban' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Kanban Board
                </button>
                <button
                  onClick={() => setActiveTab('git')}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    activeTab === 'git' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Git Integration
                </button>
                <button
                  onClick={() => setActiveTab('structure')}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    activeTab === 'structure' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Project Structure
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    activeTab === 'analytics' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
              </div>
                {activeTab === 'kanban' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Filter by Assignee:</span>
                    <select 
                      value={filterAssignee}
                      onChange={(e) => setFilterAssignee(e.target.value)}
                      className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="all">All Members</option>
                      <option value="unassigned">Unassigned</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500 ml-4">Module:</span>
                    <select
                      value={activeModuleId}
                      onChange={(e) => setActiveModuleId(e.target.value)}
                      className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="all">All Modules</option>
                      {projectModules.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500 ml-4">Sprint:</span>
                    <select
                      value={activeSprintId}
                      onChange={(e) => setActiveSprintId(e.target.value)}
                      className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="all">All Sprints</option>
                      {projectSprints.map(sp => (
                        <option key={sp.id} value={sp.id}>{sp.name}</option>
                      ))}
                    </select>
                  <button
                    onClick={() => setIsAddingSprint(true)}
                    className="text-xs px-2 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700 ml-2"
                  >
                    Add Sprint
                  </button>
                  <button
                    onClick={() => setSelectionMode(!selectionMode)}
                    className={`text-xs px-2 py-1 rounded-md ml-2 ${selectionMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {selectionMode ? 'Exit Select' : 'Select'}
                  </button>
                  {selectionMode && (
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-xs text-gray-500">Bulk:</span>
                      <select
                        onChange={(e) => {
                          const val = e.target.value as TaskStatus;
                          if (val) bulkChangeStatus(val);
                        }}
                        className="text-xs border-gray-300 rounded-md"
                        defaultValue=""
                      >
                        <option value="">Set Status</option>
                        {COLUMNS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select
                        onChange={(e) => bulkChangeAssignee(e.target.value || undefined)}
                        className="text-xs border-gray-300 rounded-md"
                        defaultValue=""
                      >
                        <option value="">Set Assignee</option>
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                      <select
                        onChange={(e) => bulkChangeSprint(e.target.value || null)}
                        className="text-xs border-gray-300 rounded-md"
                        defaultValue=""
                      >
                        <option value="">Set Sprint</option>
                        <option value="">No Sprint</option>
                        {projectSprints.map(sp => (
                          <option key={sp.id} value={sp.id}>{sp.name}</option>
                        ))}
                      </select>
                      <button onClick={clearSelection} className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Clear</button>
                    </div>
                  )}
                </div>
              )}
              <div className="relative ml-4">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-gray-500 hover:text-blue-600 text-sm"
                  title="Notifications"
                >
                  🔔
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 z-10">
                    <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Recent Activity</div>
                    <ul className="space-y-1 max-h-60 overflow-y-auto">
                      {auditLogs
                        .filter(l => l.entityType === 'Project' && l.entityId === projectId)
                        .slice(0, 10)
                        .map(l => (
                          <li key={l.id} className="text-xs text-gray-600 dark:text-gray-300">
                            <span className="text-gray-400">{new Date(l.timestamp).toLocaleString()}: </span>
                            {l.details}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
        </div>
        <div>
          {/* Add Member / Settings buttons could go here */}
        </div>
      </div>
      <div className="mb-4">
        <TimeTracker />
      </div>
      {isAddingSprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create Sprint</h2>
            <form onSubmit={handleAddSprint} className="space-y-3">
              <input
                type="text"
                placeholder="Sprint name"
                required
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Start</label>
                  <input
                    type="date"
                    value={newSprintStart}
                    onChange={(e) => setNewSprintStart(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">End</label>
                  <input
                    type="date"
                    value={newSprintEnd}
                    onChange={(e) => setNewSprintEnd(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
                  />
                </div>
              </div>
              <textarea
                rows={2}
                placeholder="Sprint goal"
                value={newSprintGoal}
                onChange={(e) => setNewSprintGoal(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
              />
              <select
                value={newSprintStatus}
                onChange={(e) => setNewSprintStatus(e.target.value as any)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
              >
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsAddingSprint(false)} className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">Cancel</button>
                <button type="submit" className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'kanban' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full flex space-x-4 min-w-max pb-4">
            {COLUMNS.map((column) => (
              <div
                key={column}
                className="w-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col max-h-full"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
              >
                <div className="p-3 font-medium text-sm text-gray-700 dark:text-gray-300 flex justify-between items-center">
                  {column}
                  <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded-full">
                    {relevantTasks.filter((t) => t.status === column).length}
                  </span>
                </div>
                
                        <div className="flex-1 p-2 overflow-y-auto space-y-2">
                              {relevantTasks
                                .filter((t) => t.status === column)
                                .map((task) => (
                                  <div
                                    key={task.id}
                                className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-600 cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
                                draggable
                                onDragStart={(e) => handleDragStart(e, task.id)}
                              >
                                <div className="text-[10px] text-gray-500 mb-1">
                                  {task.userStoryId ? 'User Story' : (task.moduleId === projectId ? 'Project' : 'Module')}
                                </div>
                                {selectionMode && (
                                  <div className="mb-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedTaskIds.includes(task.id)}
                                      onChange={() => toggleSelectTask(task.id)}
                                    />
                                  </div>
                                )}
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                  {task.title}
                                </h4>
                        <div className="flex justify-between items-center mt-2">
                           <select
                             value={task.assigneeId || ""}
                             onChange={(e) => updateTaskAssignee(task.id, e.target.value || undefined)}
                             className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-none focus:ring-0 p-0 cursor-pointer max-w-[100px]"
                             onClick={(e) => e.stopPropagation()}
                           >
                             <option value="">Unassigned</option>
                             {users.map(u => (
                               <option key={u.id} value={u.id}>{u.name}</option>
                             ))}
                           </select>
                           
                           <div className="flex space-x-1">
                             {column !== 'Backlog' && (
                               <button 
                                 onClick={() => updateTaskStatus(task.id, COLUMNS[COLUMNS.indexOf(column) - 1])}
                                 className="text-xs text-gray-500 hover:text-blue-500"
                               >
                                 ←
                               </button>
                             )}
                             {column !== 'Done' && (
                               <button 
                                 onClick={() => updateTaskStatus(task.id, COLUMNS[COLUMNS.indexOf(column) + 1])}
                                 className="text-xs text-gray-500 hover:text-blue-500"
                               >
                                 →
                               </button>
                             )}
                              <select
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  moveTaskToModule(task, val);
                                }}
                                className="text-[10px] bg-transparent border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
                                defaultValue=""
                              >
                                <option value="">Move to Module</option>
                                {projectModules.map(m => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                              </select>
                              <select
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  moveTaskToStory(task, val);
                                }}
                                className="text-[10px] bg-transparent border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
                                defaultValue=""
                              >
                                <option value="">Move to Story</option>
                                {userStories
                                  .filter(us => projectModuleIds.includes(us.moduleId))
                                  .map(us => (
                                    <option key={us.id} value={us.id}>{us.title}</option>
                                  ))}
                              </select>
                           </div>
                        </div>
                      </div>
                    ))}
                </div>

                {column === "Backlog" && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleAddTask}>
                      <input
                        type="text"
                        placeholder="+ Add Task"
                        className="w-full text-sm bg-transparent focus:outline-none text-gray-700 dark:text-gray-300"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                      />
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'structure' ? (
        <div className="flex-1 overflow-y-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Modules & User Stories
              </h2>
              <button
                onClick={() => setIsAddingModule(!isAddingModule)}
                className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                {isAddingModule ? "Cancel" : "Add Module"}
              </button>
            </div>

            {isAddingModule && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md mb-6">
                <form onSubmit={handleAddModule} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Module Name
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      value={newModuleName}
                      onChange={(e) => setNewModuleName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      value={newModuleDescription}
                      onChange={(e) => setNewModuleDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assign to Sub-Team
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      value={newModuleSubTeam}
                      onChange={(e) => setNewModuleSubTeam(e.target.value)}
                    >
                      <option value="">No Sub-Team</option>
                      {availableSubTeams.map(st => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Create Module
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {projectModules.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No modules defined yet.</p>
              ) : (
                projectModules.map(module => (
                  <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    {editingModuleId === module.id ? (
                      <form onSubmit={handleSaveModule} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Module Name</label>
                          <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1"
                            value={editModuleName}
                            onChange={(e) => setEditModuleName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1"
                            value={editModuleDescription}
                            onChange={(e) => setEditModuleDescription(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign to Sub-Team</label>
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1"
                            value={editModuleSubTeam}
                            onChange={(e) => setEditModuleSubTeam(e.target.value)}
                          >
                            <option value="">No Sub-Team</option>
                            {availableSubTeams.map(st => (
                              <option key={st.id} value={st.id}>{st.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingModuleId(null)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-md font-medium text-gray-900 dark:text-white">
                              {module.name}
                            </h3>
                            <p className="text-sm text-gray-500">{module.description}</p>
                            <div className="mt-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300">Sprints</h4>
                                <button
                                  onClick={() => setAddingModuleSprintFor(addingModuleSprintFor === module.id ? null : module.id)}
                                  className="text-xs px-2 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                  {addingModuleSprintFor === module.id ? 'Cancel' : 'Add Sprint'}
                                </button>
                              </div>
                              {addingModuleSprintFor === module.id && (
                                <form onSubmit={(e) => handleAddModuleSprint(e, module.id)} className="mt-2 grid grid-cols-2 gap-2">
                                  <select
                                    value={newModuleParentSprintId}
                                    onChange={(e) => setNewModuleParentSprintId(e.target.value)}
                                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1 text-xs"
                                    required
                                  >
                                    <option value="">Select parent project sprint</option>
                                    {projectSprints.filter(sp => sp.moduleId === null).map(sp => (
                                      <option key={sp.id} value={sp.id}>{sp.name}</option>
                                    ))}
                                  </select>
                                  <input
                                    type="text"
                                    placeholder="Sprint name"
                                    required
                                    value={newModuleSprintName}
                                    onChange={(e) => setNewModuleSprintName(e.target.value)}
                                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1 text-xs"
                                  />
                                  <input
                                    type="date"
                                    value={newModuleSprintStart}
                                    onChange={(e) => setNewModuleSprintStart(e.target.value)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1 text-xs"
                                  />
                                  <input
                                    type="date"
                                    value={newModuleSprintEnd}
                                    onChange={(e) => setNewModuleSprintEnd(e.target.value)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1 text-xs"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Goal"
                                    value={newModuleSprintGoal}
                                    onChange={(e) => setNewModuleSprintGoal(e.target.value)}
                                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1 text-xs"
                                  />
                                  <select
                                    value={newModuleSprintStatus}
                                    onChange={(e) => setNewModuleSprintStatus(e.target.value as any)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-1 text-xs"
                                  >
                                    <option value="Planned">Planned</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                  <div className="col-span-2 flex justify-end">
                                    <button type="submit" className="text-xs px-2 py-1 rounded-md text-white bg-green-600 hover:bg-green-700">Create</button>
                                  </div>
                                </form>
                              )}
                              <ul className="mt-2 space-y-1">
                                {getModuleSprints(module.id).length === 0 ? (
                                  <li className="text-[11px] text-gray-500">No sprints for this module.</li>
                                ) : (
                                  getModuleSprints(module.id).map(sp => {
                                    const prog = getSprintProgress(sp.id);
                                    return (
                                      <li key={sp.id} className="flex items-center justify-between text-[11px] text-gray-700 dark:text-gray-300">
                                        <span>{sp.name} • {sp.status}</span>
                                        <span className="text-[10px] text-gray-500">
                                          Stories {prog.storyCount} • Tasks {prog.doneTaskCount}/{prog.taskCount}
                                        </span>
                                      </li>
                                    );
                                  })
                                )}
                              </ul>
                            </div>
                          </div>
                            <div className="flex items-center space-x-2">
                              {module.assignedSubTeamId && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {availableSubTeams.find(st => st.id === module.assignedSubTeamId)?.name || "Sub-Team"}
                                </span>
                              )}
                              <a
                                href={`/modules/${module.id}`}
                                className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                                title="Open Module Board"
                              >
                                Open Board
                              </a>
                              <button
                                onClick={() => handleEditModule(module)}
                                className="text-gray-400 hover:text-blue-500"
                                title="Edit"
                              >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteModule(module.id)}
                              className="text-gray-400 hover:text-red-500"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {/* User Stories Section */}
                        <div className="mt-4 pl-4 border-l-2 border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User Stories</h4>
                            <button
                              onClick={() => setIsAddingStory(isAddingStory === module.id ? null : module.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {isAddingStory === module.id ? "Cancel" : "+ Add Story"}
                            </button>
                          </div>

                          {isAddingStory === module.id && (
                            <form onSubmit={(e) => handleAddUserStory(e, module.id)} className="mb-3 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Story Title"
                                  className="flex-1 text-sm rounded border-gray-300 dark:bg-gray-800 dark:border-gray-600 p-1"
                                  value={newStoryTitle}
                                  onChange={(e) => setNewStoryTitle(e.target.value)}
                                  autoFocus
                                />
                                <input
                                  type="number"
                                  placeholder="Pts"
                                  className="w-16 text-sm rounded border-gray-300 dark:bg-gray-800 dark:border-gray-600 p-1"
                                  value={newStoryPoints}
                                  onChange={(e) => setNewStoryPoints(Number(e.target.value))}
                                  min="1"
                                />
                                <button type="submit" className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Add</button>
                              </div>
                            </form>
                          )}

                          <div className="space-y-2">
                            {userStories.filter(s => s.moduleId === module.id).length === 0 ? (
                              <p className="text-xs text-gray-400 italic">No stories yet.</p>
                            ) : (
                              userStories.filter(s => s.moduleId === module.id).map(story => (
                                <div key={story.id} className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-sm group/story">
                                  {editingStoryId === story.id ? (
                                    <form onSubmit={handleUpdateUserStory} className="flex gap-2 items-center">
                                      <input
                                        type="text"
                                        className="flex-1 text-sm rounded border-gray-300 p-1"
                                        value={editStoryTitle}
                                        onChange={(e) => setEditStoryTitle(e.target.value)}
                                      />
                                      <input
                                        type="number"
                                        className="w-12 text-sm rounded border-gray-300 p-1"
                                        value={editStoryPoints}
                                        onChange={(e) => setEditStoryPoints(Number(e.target.value))}
                                      />
                                      <button type="submit" className="text-green-600 hover:text-green-800">✓</button>
                                      <button type="button" onClick={() => setEditingStoryId(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                                    </form>
                                  ) : (
                                     <div className="flex flex-col">
                                       <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleStoryExpand(story.id)}>
                                         <div className="flex items-center">
                                           <span className="text-gray-400 mr-2 text-xs transform transition-transform duration-200" style={{ transform: expandedStories.includes(story.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                                           <span className="font-medium text-gray-900 dark:text-white">{story.title}</span>
                                           <span className="ml-2 text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-1.5 rounded-full">{story.points} pts</span>
                                         </div>
                                       <div className="flex items-center space-x-2">
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             setEditingStoryId(story.id);
                                             setEditStoryTitle(story.title);
                                             setEditStoryPoints(story.points);
                                           }}
                                           className="text-gray-400 hover:text-blue-500 hidden group-hover/story:block"
                                         >
                                           ✎
                                         </button>
                                         <select
                                           value={story.sprintId || ""}
                                           onChange={(e) => updateUserStory(story.id, { sprintId: e.target.value || null })}
                                           className="text-[10px] bg-transparent border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
                                         >
                                           <option value="">No Sprint</option>
                                           {[...projectSprints, ...getModuleSprints(module.id)].map(sp => (
                                             <option key={sp.id} value={sp.id}>{sp.name}</option>
                                           ))}
                                         </select>
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleDeleteUserStory(story.id);
                                           }}
                                           className="text-gray-400 hover:text-red-500 hidden group-hover/story:block"
                                         >
                                           ✕
                                         </button>
                                       </div>
                                       </div>

                                       {/* Tasks Section (Nested) */}
                                       {expandedStories.includes(story.id) && (
                                         <div className="mt-2 pl-6 border-l border-gray-200 dark:border-gray-600">
                                           <div className="flex justify-between items-center mb-2">
                                             <span className="text-[10px] uppercase text-gray-400 font-semibold">Tasks</span>
                                             <button
                                               onClick={() => setIsAddingTask(isAddingTask === story.id ? null : story.id)}
                                               className="text-[10px] text-blue-600 hover:text-blue-800"
                                             >
                                               {isAddingTask === story.id ? "Cancel" : "+ Add Task"}
                                             </button>
                                           </div>

                                           {isAddingTask === story.id && (
                                             <form onSubmit={(e) => handleAddTaskToStory(e, story.id, module.id)} className="mb-2">
                                               <div className="flex gap-2">
                                                 <input
                                                   type="text"
                                                   placeholder="Task Title"
                                                   className="flex-1 text-xs rounded border-gray-300 dark:bg-gray-800 dark:border-gray-600 p-1"
                                                   value={newTaskTitleStruct}
                                                   onChange={(e) => setNewTaskTitleStruct(e.target.value)}
                                                   autoFocus
                                                 />
                                                 <button type="submit" className="px-2 py-0.5 bg-green-600 text-white text-[10px] rounded">Add</button>
                                               </div>
                                             </form>
                                           )}

                                           <div className="space-y-1">
                                             {tasks.filter(t => t.userStoryId === story.id).length === 0 ? (
                                               <p className="text-[10px] text-gray-400 italic">No tasks yet.</p>
                                             ) : (
                                               tasks.filter(t => t.userStoryId === story.id).map(task => (
                                                 <div key={task.id} className="flex justify-between items-center text-xs bg-white dark:bg-gray-800 p-1.5 rounded border border-gray-100 dark:border-gray-700 group/task">
                                                   <div className="flex items-center gap-2">
                                                     <span className={`w-2 h-2 rounded-full ${
                                                       task.status === 'Done' ? 'bg-green-500' : 
                                                       task.status === 'InProgress' ? 'bg-blue-500' : 'bg-gray-300'
                                                     }`} title={task.status}></span>
                                                     <span className="text-gray-700 dark:text-gray-300">{task.title}</span>
                                                     <select
                                                       value={task.status}
                                                       onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                                                       className="text-[10px] bg-transparent border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
                                                     >
                                                       {COLUMNS.map((s) => (
                                                         <option key={s} value={s}>{s}</option>
                                                       ))}
                                                     </select>
                                                     <select
                                                       value={task.assigneeId || ""}
                                                       onChange={(e) => updateTaskAssignee(task.id, e.target.value || undefined)}
                                                       className="text-[10px] bg-transparent border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
                                                     >
                                                       <option value="">Unassigned</option>
                                                       {users.map(u => (
                                                         <option key={u.id} value={u.id}>{u.name}</option>
                                                       ))}
                                                     </select>
                                                     <select
                                                       value={task.sprintId || ""}
                                                       onChange={(e) => updateTask(task.id, { sprintId: e.target.value || null })}
                                                       className="text-[10px] bg-transparent border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
                                                     >
                                                       <option value="">No Sprint</option>
                                                       {[...projectSprints, ...getModuleSprints(module.id)].map(sp => (
                                                         <option key={sp.id} value={sp.id}>{sp.name}</option>
                                                       ))}
                                                     </select>
                                                   </div>
                                                   <button
                                                     onClick={() => handleDeleteTask(task.id)}
                                                     className="text-gray-400 hover:text-red-500 hidden group-hover/task:block"
                                                   >
                                                     ✕
                                                   </button>
                                                 </div>
                                               ))
                                             )}
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'analytics' ? (
        <div className="flex-1 overflow-y-auto space-y-6 p-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sprint Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Total Sprints</div>
                <div className="text-2xl font-semibold">{projectSprints.length}</div>
              </div>
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Stories in Selected Sprint</div>
                <div className="text-2xl font-semibold">
                  {activeSprintId === 'all' ? userStories.filter(us => projectModuleIds.includes(us.moduleId)).length : userStories.filter(us => us.sprintId === activeSprintId).length}
                </div>
              </div>
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Tasks Done in Selected Sprint</div>
                <div className="text-2xl font-semibold">
                  {activeSprintId === 'all'
                    ? tasks.filter(t => t.status === 'Done' && projectModuleIds.includes(t.moduleId)).length
                    : tasks.filter(t => {
                        if (!t.userStoryId) return false;
                        const st = userStories.find(s => s.id === t.userStoryId);
                        return t.status === 'Done' && st?.sprintId === activeSprintId;
                      }).length}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sprint Breakdown</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2">Sprint</th>
                    <th className="py-2">Stories</th>
                    <th className="py-2">Tasks Done/Total</th>
                  </tr>
                </thead>
                <tbody>
                  {projectSprints.map(sp => {
                    const prog = getSprintProgress(sp.id);
                    return (
                      <tr key={sp.id} className="border-t">
                        <td className="py-2">{sp.name}</td>
                        <td className="py-2">{prog.storyCount}</td>
                        <td className="py-2">{prog.doneTaskCount}/{prog.taskCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TimeReports projectId={projectId} />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <GitIntegration projectId={projectId} />
        </div>
      )}
    </div>
  );
}
