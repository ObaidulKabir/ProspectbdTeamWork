"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Task, TaskStatus, UserStory } from "@/types/schema";

const COLUMNS: TaskStatus[] = ["Backlog", "ToDo", "InProgress", "Review", "Done"];

export default function ModuleBoardPage() {
  const params = useParams();
  const moduleId = params.id as string;
  const router = useRouter();
  const {
    modules,
    projects,
    tasks,
    userStories,
    users,
    sprints,
    updateTaskStatus,
    updateTaskAssignee,
    updateTask,
  } = useAppStore();

  const mod = modules.find((m) => m.id === moduleId);
  const project = projects.find((p) => p.id === mod?.projectId);

  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  if (!mod || !project) {
    return <div className="p-6">Module not found</div>;
  }

  const moduleStories = userStories.filter((us) => us.moduleId === moduleId);
  const moduleSprints = sprints.filter((sp) => sp.projectId === project.id && sp.moduleId === moduleId);

  const tasksInModule = tasks.filter((t) => t.moduleId === moduleId);

  const getTaskSprintId = (t: Task): string | null => {
    if (t.sprintId) return t.sprintId;
    if (t.userStoryId) {
      const st = moduleStories.find((s) => s.id === t.userStoryId);
      return st?.sprintId || null;
    }
    return null;
  };

  const taskBelongsToAssignee = (t: Task) => {
    if (filterAssignee === "all") return true;
    if (filterAssignee === "unassigned") return !t.assigneeId;
    return t.assigneeId === filterAssignee;
  };

  const sortedTasks = useMemo(() => {
    const arr = [...tasksInModule].filter(taskBelongsToAssignee);
    arr.sort((a, b) => {
      const cmp = a.title.localeCompare(b.title);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [tasksInModule, filterAssignee, sortDir]);

  const lanes: Array<{ id: string | null; name: string }> = [
    { id: null, name: "No Sprint" },
    ...moduleSprints.map((sp) => ({ id: sp.id, name: sp.name })),
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus, laneSprintId: string | null) => {
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskStatus(taskId, status);
    updateTask(taskId, { sprintId: laneSprintId });
  };

  const backToProject = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between px-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{mod.name} Board</h1>
          <p className="text-xs text-gray-500">Project: {project.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Assignee:</span>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All</option>
              <option value="unassigned">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Sort:</span>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
              className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="asc">Title A→Z</option>
              <option value="desc">Title Z→A</option>
            </select>
          </div>
          <button
            onClick={backToProject}
            className="text-xs px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Back to Project
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 px-2">
        {lanes.map((lane) => {
          const laneTasks = sortedTasks.filter((t) => {
            const sid = getTaskSprintId(t);
            return sid === lane.id;
          });
          return (
            <div key={lane.id || "no-sprint"}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sprint: {lane.name}
                </h2>
                <span className="text-xs text-gray-500">
                  {laneTasks.length} tasks
                </span>
              </div>
              <div className="h-72 flex space-x-4 overflow-x-auto">
                {COLUMNS.map((column) => (
                  <div
                    key={`${lane.id}-${column}`}
                    className="w-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column, lane.id)}
                  >
                    <div className="p-3 font-medium text-sm text-gray-700 dark:text-gray-300 flex justify-between items-center">
                      {column}
                      <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded-full">
                        {laneTasks.filter((t) => t.status === column).length}
                      </span>
                    </div>
                    <div className="flex-1 p-2 overflow-y-auto space-y-2">
                      {laneTasks
                        .filter((t) => t.status === column)
                        .map((task) => {
                          const story = task.userStoryId
                            ? (moduleStories.find((s) => s.id === task.userStoryId) as UserStory | undefined)
                            : undefined;
                          return (
                            <div
                              key={task.id}
                              className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-600 cursor-grab hover:shadow-md transition-shadow"
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                            >
                              <div className="text-[10px] text-gray-500 mb-1">
                                {task.userStoryId ? 'User Story' : 'Module'}
                              </div>
                              <div className="text-xs text-gray-500 mb-1">
                                {story ? `Story: ${story.title}` : "No Story"}
                              </div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {task.title}
                              </h4>
                              <div className="flex justify-between items-center mt-2">
                                <select
                                  value={task.assigneeId || ""}
                                  onChange={(e) => updateTaskAssignee(task.id, e.target.value || undefined)}
                                  className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-none focus:ring-0 p-0 cursor-pointer max-w-[100px]"
                                >
                                  <option value="">Unassigned</option>
                                  {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.name}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={getTaskSprintId(task) || ""}
                                  onChange={(e) => updateTask(task.id, { sprintId: e.target.value || null })}
                                  className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-none focus:ring-0 p-0 cursor-pointer max-w-[120px]"
                                >
                                  <option value="">No Sprint</option>
                                  {moduleSprints.map((sp) => (
                                    <option key={sp.id} value={sp.id}>
                                      {sp.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
