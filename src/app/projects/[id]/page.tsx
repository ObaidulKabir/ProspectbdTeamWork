"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Task, TaskStatus } from "@/types/schema";
import { GitIntegration } from "@/components/GitIntegration";

const COLUMNS: TaskStatus[] = ["Backlog", "ToDo", "InProgress", "Review", "Done"];

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { projects, tasks, addTask, updateTaskStatus, updateTaskAssignee, currentUser, modules, users } = useAppStore();
  const [activeTab, setActiveTab] = useState<'kanban' | 'git'>('kanban');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  const project = projects.find((p) => p.id === projectId);
  const projectModuleIds = modules.filter(m => m.projectId === projectId).map(m => m.id);
  
  const relevantTasks = tasks.filter(t => {
    const isProjectTask = projectModuleIds.includes(t.moduleId) || t.moduleId === projectId;
    if (!isProjectTask) return false;
    
    if (filterAssignee !== 'all' && t.assigneeId !== filterAssignee) return false;
    
    return true;
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");

  if (!project) {
    return <div>Project not found</div>;
  }

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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {project.name}
          </h1>
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
              </div>
            )}
          </div>
        </div>
        <div>
          {/* Add Member / Settings buttons could go here */}
        </div>
      </div>

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
      ) : (
        <div className="flex-1 overflow-y-auto">
          <GitIntegration projectId={projectId} />
        </div>
      )}
    </div>
  );
}
