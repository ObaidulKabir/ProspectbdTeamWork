import { Project, Module, UserStory, Task, Sprint, TimeEntry } from "@/types/schema";

type DataShape = {
  projects: Project[];
  modules: Module[];
  userStories: UserStory[];
  tasks: Task[];
  sprints: Sprint[];
  timeEntries: TimeEntry[];
};

const g = globalThis as any;
if (!g.__prospectbd_store__) {
  g.__prospectbd_store__ = {
    projects: [],
    modules: [],
    userStories: [],
    tasks: [],
    sprints: [],
    timeEntries: [],
  } as DataShape;
}

const data: DataShape = g.__prospectbd_store__;

export const serverStore = {
  getAll: () => data,
  getProjects: () => data.projects,
  addProject: (p: Project) => {
    data.projects.push(p);
    return p;
  },
  updateProject: (id: string, updates: Partial<Project>) => {
    data.projects = data.projects.map((x) => (x.id === id ? { ...x, ...updates } : x));
    return data.projects.find((x) => x.id === id) || null;
  },
  deleteProject: (id: string) => {
    data.projects = data.projects.filter((x) => x.id !== id);
    data.modules = data.modules.filter((m) => m.projectId !== id);
    const moduleIds = new Set(data.modules.map((m) => m.id));
    data.userStories = data.userStories.filter((s) => moduleIds.has(s.moduleId));
    const storyIds = new Set(data.userStories.map((s) => s.id));
    data.tasks = data.tasks.filter((t) => !t.userStoryId || storyIds.has(t.userStoryId));
    data.sprints = data.sprints.filter((sp) => sp.projectId !== id);
    return true;
  },
  getProjectAggregate: (id: string) => {
    const project = data.projects.find((p) => p.id === id) || null;
    const modules = data.modules.filter((m) => m.projectId === id);
    const moduleIds = new Set(modules.map((m) => m.id));
    const userStories = data.userStories.filter((s) => moduleIds.has(s.moduleId));
    const storyIds = new Set(userStories.map((s) => s.id));
    const tasks = data.tasks.filter((t) => t.userStoryId && storyIds.has(t.userStoryId));
    const sprints = data.sprints.filter((sp) => sp.projectId === id);
    return { project, modules, userStories, tasks, sprints };
  },
  getModules: () => data.modules,
  addModule: (m: Module) => {
    data.modules.push(m);
    return m;
  },
  updateModule: (id: string, updates: Partial<Module>) => {
    data.modules = data.modules.map((x) => (x.id === id ? { ...x, ...updates } : x));
    return data.modules.find((x) => x.id === id) || null;
  },
  deleteModule: (id: string) => {
    data.modules = data.modules.filter((x) => x.id !== id);
    data.userStories = data.userStories.filter((s) => s.moduleId !== id);
    data.tasks = data.tasks.filter((t) => t.moduleId !== id);
    data.sprints = data.sprints.filter((sp) => sp.moduleId !== id);
    return true;
  },
  getStories: () => data.userStories,
  addStory: (s: UserStory) => {
    data.userStories.push(s);
    return s;
  },
  updateStory: (id: string, updates: Partial<UserStory>) => {
    data.userStories = data.userStories.map((x) => (x.id === id ? { ...x, ...updates } : x));
    return data.userStories.find((x) => x.id === id) || null;
  },
  deleteStory: (id: string) => {
    data.userStories = data.userStories.filter((x) => x.id !== id);
    data.tasks = data.tasks.filter((t) => t.userStoryId !== id);
    return true;
  },
  getTasks: () => data.tasks,
  addTask: (t: Task) => {
    data.tasks.push(t);
    return t;
  },
  updateTask: (id: string, updates: Partial<Task>) => {
    const task = data.tasks.find((x) => x.id === id);
    if (!task) return null;
    let next = { ...task, ...updates } as Task;
    next.taskLevel = next.userStoryId ? 'UserStory' : (data.modules.find(m => m.id === next.moduleId) ? 'Module' : 'Project');
    if (updates.sprintId !== undefined) {
      const sprintId = updates.sprintId || null;
      if (sprintId === null) {
        next.sprintId = null;
      } else {
        const sp = data.sprints.find((s) => s.id === sprintId);
        if (!sp) return null;
        const mod = data.modules.find((m) => m.id === next.moduleId);
        if (!mod) return null;
        if (sp.projectId !== mod.projectId) return null;
        if (sp.scope === 'Module') {
          if (sp.moduleId !== next.moduleId) return null;
          const parent = sp.parentProjectSprintId ? data.sprints.find((ps) => ps.id === sp.parentProjectSprintId) : null;
          if (!parent) return null;
          if (parent.projectId !== sp.projectId) return null;
          if (parent.moduleId) return null;
        } else {
          if (sp.moduleId) return null;
        }
      }
    }
    data.tasks = data.tasks.map((x) => (x.id === id ? next : x));
    return data.tasks.find((x) => x.id === id) || null;
  },
  deleteTask: (id: string) => {
    data.tasks = data.tasks.filter((x) => x.id !== id);
    return true;
  },
  getSprints: () => data.sprints,
  getTimeEntries: () => data.timeEntries,
  addTimeEntry: (te: TimeEntry) => {
    data.timeEntries.push(te);
    return te;
  },
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => {
    data.timeEntries = data.timeEntries.map((x) => (x.id === id ? { ...x, ...updates } : x));
    return data.timeEntries.find((x) => x.id === id) || null;
  },
  listTimeEntriesByUser: (userId: string) => data.timeEntries.filter((t) => t.userId === userId),
  listTimeEntriesByProject: (projectId: string) => data.timeEntries.filter((t) => t.projectId === projectId),
  getTimeSummary: (sinceISO: string, untilISO: string) => {
    const s = new Date(sinceISO).getTime();
    const u = new Date(untilISO).getTime();
    const entries = data.timeEntries.filter((t) => {
      const st = new Date(t.startTs).getTime();
      const en = new Date((t.endTs || t.startTs)).getTime();
      return st >= s && en <= u;
    });
    const totalSeconds = entries.reduce((acc, e) => acc + e.totalSeconds, 0);
    const byProject: Record<string, number> = {};
    entries.forEach((e) => {
      byProject[e.projectId] = (byProject[e.projectId] || 0) + e.totalSeconds;
    });
    return { totalSeconds, byProject, count: entries.length };
  },
  addSprint: (sp: Sprint) => {
    const start = new Date(sp.startDate);
    const end = new Date(sp.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return sp;
    if (start > end) return sp;
    const project = data.projects.find((p) => p.id === sp.projectId);
    if (!project) return sp;
    if (sp.scope === 'Project') {
      if (sp.parentProjectSprintId) return sp;
      if (sp.moduleId) return sp;
      data.sprints.push(sp);
      return sp;
    }
    const mod = data.modules.find((m) => m.id === sp.moduleId!);
    if (!mod || mod.projectId !== sp.projectId) return sp;
    const parent = sp.parentProjectSprintId ? data.sprints.find((ps) => ps.id === sp.parentProjectSprintId) : null;
    if (!parent) return sp;
    if (parent.projectId !== sp.projectId) return sp;
    if (parent.moduleId) return sp;
    const pStart = new Date(parent.startDate);
    const pEnd = new Date(parent.endDate);
    if (start < pStart || end > pEnd) return sp;
    data.sprints.push(sp);
    return sp;
  },
  updateSprint: (id: string, updates: Partial<Sprint>) => {
    const existing = data.sprints.find((x) => x.id === id);
    if (!existing) return null;
    const next: Sprint = { ...existing, ...updates };
    const start = new Date(next.startDate);
    const end = new Date(next.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return existing;
    if (start > end) return existing;
    const project = data.projects.find((p) => p.id === next.projectId);
    if (!project) return existing;
    if (next.scope === 'Project') {
      if (next.parentProjectSprintId) return existing;
      if (next.moduleId) return existing;
    } else {
      const mod = data.modules.find((m) => m.id === next.moduleId!);
      if (!mod || mod.projectId !== next.projectId) return existing;
      const parent = next.parentProjectSprintId ? data.sprints.find((ps) => ps.id === next.parentProjectSprintId) : null;
      if (!parent) return existing;
      if (parent.projectId !== next.projectId) return existing;
      if (parent.moduleId) return existing;
      const pStart = new Date(parent.startDate);
      const pEnd = new Date(parent.endDate);
      if (start < pStart || end > pEnd) return existing;
    }
    data.sprints = data.sprints.map((x) => (x.id === id ? next : x));
    return data.sprints.find((x) => x.id === id) || null;
  },
  deleteSprint: (id: string) => {
    data.sprints = data.sprints.filter((x) => x.id !== id);
    return true;
  },
  sprintSummaryByProject: (projectId: string) => {
    const sprints = data.sprints.filter((sp) => sp.projectId === projectId);
    const stories = data.userStories.filter((us) => us.sprintId && sprints.find((sp) => sp.id === us.sprintId));
    const tasks = data.tasks.filter((t) => {
      if (t.sprintId) return sprints.find((sp) => sp.id === t.sprintId);
      if (t.userStoryId) {
        const st = stories.find((s) => s.id === t.userStoryId);
        return !!st;
      }
      return false;
    });
    const doneTasks = tasks.filter((t) => t.status === "Done").length;
    return { sprintsCount: sprints.length, storiesCount: stories.length, tasksDone: doneTasks, tasksTotal: tasks.length };
  },
};
