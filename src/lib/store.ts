import { create } from 'zustand';
import { User, Project, Module, Task, TimeLog, UserRole, DaySchedule, Team, TeamMember, AuditLog, SubTeam, UserStory, Sprint, TimeEntry, TimeEntryStatus } from '@/types/schema';

interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  modules: Module[];
  tasks: Task[];
  timeLogs: TimeLog[];
  timeEntries: TimeEntry[];
  activeTimerByUser: Record<string, string | null>;
  teams: Team[];
  auditLogs: AuditLog[];
  userStories: UserStory[];
  sprints: Sprint[];

  // Actions
  setCurrentUser: (user: User | null) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  addProject: (project: Project) => void;
  addModule: (module: Module) => void;
  updateModule: (moduleId: string, updates: Partial<Module>) => void;
  deleteModule: (moduleId: string) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  updateTaskAssignee: (taskId: string, assigneeId: string | undefined) => void;
  deleteTask: (taskId: string) => void;
  setTaskDependencies: (taskId: string, dependencyIds: string[]) => void;
  setTaskActualHours: (taskId: string, hours: number) => void;
  logTime: (log: TimeLog) => void;
  startTimer: (userId: string, projectId: string, notes?: string) => void;
  pauseTimer: (userId: string) => void;
  resumeTimer: (userId: string) => void;
  stopTimer: (userId: string) => void;
  tickTimer: (userId: string) => void;
  addAuditLog: (log: AuditLog) => void;
  
  // Team Actions
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  addTeamMember: (teamId: string, member: TeamMember) => void;
  removeTeamMember: (teamId: string, userId: string) => void;
  updateTeamMember: (teamId: string, userId: string, updates: Partial<TeamMember>) => void;
  
  // New Hierarchy Actions
  addSubTeam: (teamId: string, subTeam: SubTeam) => void;
  updateSubTeam: (teamId: string, subTeamId: string, updates: Partial<SubTeam>) => void;
  addSubTeamMember: (teamId: string, subTeamId: string, userId: string) => void;
  removeSubTeamMember: (teamId: string, subTeamId: string, userId: string) => void;
  addUserStory: (story: UserStory) => void;
  updateUserStory: (storyId: string, updates: Partial<UserStory>) => void;
  deleteUserStory: (storyId: string) => void;
  setUserStoryAcceptanceCriteria: (storyId: string, criteria: string[]) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
}

// Mock Data
const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@prospectbd.com',
    role: 'Admin',
    contractHoursPerWeek: 40,
    availableHours: 40,
    skills: [{ name: 'Management', level: 'Expert' }],
    timezone: 'UTC',
    weeklyAvailability: [],
  },
  {
    id: 'u2',
    name: 'Jane Dev',
    email: 'jane@prospectbd.com',
    role: 'Coder',
    contractHoursPerWeek: 40,
    availableHours: 20,
    skills: [
      { name: 'React', level: 'Expert' },
      { name: 'Next.js', level: 'Advanced' },
      { name: 'TypeScript', level: 'Advanced' },
    ],
    timezone: 'UTC',
    weeklyAvailability: [],
  },
  {
    id: 'u3',
    name: 'John Lead',
    email: 'john@prospectbd.com',
    role: 'TeamLead',
    contractHoursPerWeek: 40,
    availableHours: 30,
    skills: [
      { name: 'Leadership', level: 'Expert' },
      { name: 'Architecture', level: 'Advanced' },
    ],
    timezone: 'UTC',
    weeklyAvailability: [],
  },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'SDLC Management System',
    description: 'Internal tool for managing software development lifecycle.',
    managerId: 'u1',
    teamLeadId: 'u3',
    teamMemberIds: ['u2', 'u3'],
    status: 'Implementation',
    startDate: '2023-10-01',
    assignedTeamId: null,
  },
];

export const useAppStore = create<AppState>((set) => ({
  currentUser: MOCK_USERS[0], // Default logged in as Admin
  users: MOCK_USERS,
  projects: MOCK_PROJECTS,
  modules: [],
  tasks: [],
  timeLogs: [],
  timeEntries: [],
  activeTimerByUser: {},
  teams: [],
  auditLogs: [],
  userStories: [],
  sprints: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  updateProject: (projectId, updates) =>
    set((state) => {
      // Check if assignment changed
      const project = state.projects.find(p => p.id === projectId);
      if (updates.assignedTeamId && project && project.assignedTeamId !== updates.assignedTeamId) {
        const team = state.teams.find(t => t.id === updates.assignedTeamId);
        const log: AuditLog = {
          id: `audit-${Date.now()}`,
          action: 'Project Assignment',
          entityId: projectId,
          entityType: 'Project',
          userId: state.currentUser?.id || 'system',
          timestamp: new Date().toISOString(),
          details: `Project "${project.name}" was assigned to team "${team?.name || 'Unknown'}"`
        };
        return {
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, ...updates } : p
          ),
          auditLogs: [log, ...state.auditLogs]
        };
      }
      return {
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, ...updates } : p
        ),
      };
    }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  addProject: (project) => set((state) => {
    const logs = [...state.auditLogs];
    if (project.assignedTeamId) {
      const team = state.teams.find(t => t.id === project.assignedTeamId);
      logs.unshift({
        id: `audit-${Date.now()}`,
        action: 'Project Assignment',
        entityId: project.id,
        entityType: 'Project',
        userId: state.currentUser?.id || 'system',
        timestamp: new Date().toISOString(),
        details: `New project "${project.name}" assigned to team "${team?.name || 'Unknown'}"`
      });
    }
    return { 
      projects: [...state.projects, project],
      auditLogs: logs
    };
  }),
  addModule: (module) => set((state) => ({ modules: [...state.modules, module] })),
  updateModule: (moduleId, updates) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    })),
  deleteModule: (moduleId) =>
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== moduleId),
    })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return { tasks: state.tasks };
      const currentUser = state.currentUser;
      const role = currentUser?.role || 'Coder';
      const originalLevel: any = task.taskLevel || (task.userStoryId ? 'UserStory' : (state.modules.find(m => m.id === task.moduleId) ? 'Module' : 'Project'));
      let nextTask = { ...task, ...updates } as Task;
      const nextLevel: any = nextTask.userStoryId ? 'UserStory' : (state.modules.find(m => m.id === nextTask.moduleId) ? 'Module' : 'Project');
      const levelChanged = originalLevel !== nextLevel;
      const allowedRoles = ['Admin','Manager','TeamLead'];
      if (levelChanged && !allowedRoles.includes(role)) {
        return { tasks: state.tasks };
      }
      if (updates.sprintId !== undefined) {
        const sprintId = updates.sprintId || null;
        if (sprintId === null) {
          nextTask.sprintId = null;
        } else {
          const sp = state.sprints.find((s) => s.id === sprintId);
          if (!sp) return { tasks: state.tasks };
          const mod = state.modules.find((m) => m.id === nextTask.moduleId);
          if (!mod) return { tasks: state.tasks };
          if (sp.projectId !== mod.projectId) return { tasks: state.tasks };
          if (sp.scope === 'Module') {
            if (sp.moduleId !== nextTask.moduleId) return { tasks: state.tasks };
            const parent = sp.parentProjectSprintId ? state.sprints.find((ps) => ps.id === sp.parentProjectSprintId) : null;
            if (!parent) return { tasks: state.tasks };
            if (parent.projectId !== sp.projectId) return { tasks: state.tasks };
            if (parent.moduleId) return { tasks: state.tasks };
          } else {
            if (sp.moduleId) return { tasks: state.tasks };
          }
        }
      }
      nextTask.taskLevel = nextLevel as any;
      return {
        tasks: state.tasks.map((t) => (t.id === taskId ? nextTask : t)),
      };
    }),
  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),
  updateTaskAssignee: (taskId, assigneeId) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, assigneeId } : t)),
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),
  setTaskDependencies: (taskId, dependencyIds) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, dependencyIds } : t)),
    })),
  setTaskActualHours: (taskId, hours) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, actualHours: hours } : t)),
    })),
  logTime: (log) => set((state) => ({ timeLogs: [...state.timeLogs, log] })),
  startTimer: (userId, projectId, notes) =>
    set((state) => {
      if (!userId || !projectId) return {};
      const existingActiveId = state.activeTimerByUser[userId] || null;
      if (existingActiveId) return {};
      const now = new Date().toISOString();
      const id = `te-${Date.now()}`;
      const entry: TimeEntry = {
        id,
        userId,
        projectId,
        startTs: now,
        totalSeconds: 0,
        pauses: [],
        notes,
        status: 'Running',
        updates: [now],
      };
      const audit: AuditLog = {
        id: `audit-${Date.now()}`,
        action: 'TimeEntry Start',
        entityId: id,
        entityType: 'Project',
        userId: userId,
        timestamp: now,
        details: `Timer started for project ${projectId}`,
      };
      return {
        timeEntries: [...state.timeEntries, entry],
        activeTimerByUser: { ...state.activeTimerByUser, [userId]: id },
        auditLogs: [audit, ...state.auditLogs],
      };
    }),
  pauseTimer: (userId) =>
    set((state) => {
      const id = state.activeTimerByUser[userId] || null;
      if (!id) return {};
      const now = new Date().toISOString();
      const entries = state.timeEntries.map((e) => {
        if (e.id !== id || e.status !== 'Running') return e;
        return { ...e, status: 'Paused', pauses: [...e.pauses, { start: now }], updates: [...e.updates, now] };
      });
      const audit: AuditLog = {
        id: `audit-${Date.now()}`,
        action: 'TimeEntry Pause',
        entityId: id,
        entityType: 'Project',
        userId,
        timestamp: now,
        details: `Timer paused`,
      };
      return { timeEntries: entries, auditLogs: [audit, ...state.auditLogs] };
    }),
  resumeTimer: (userId) =>
    set((state) => {
      const id = state.activeTimerByUser[userId] || null;
      if (!id) return {};
      const now = new Date().toISOString();
      const entries = state.timeEntries.map((e) => {
        if (e.id !== id || e.status !== 'Paused') return e;
        const pauses = [...e.pauses];
        if (pauses.length > 0 && !pauses[pauses.length - 1].end) {
          pauses[pauses.length - 1] = { ...pauses[pauses.length - 1], end: now };
        }
        return { ...e, status: 'Running', pauses, updates: [...e.updates, now] };
      });
      const audit: AuditLog = {
        id: `audit-${Date.now()}`,
        action: 'TimeEntry Resume',
        entityId: id,
        entityType: 'Project',
        userId,
        timestamp: now,
        details: `Timer resumed`,
      };
      return { timeEntries: entries, auditLogs: [audit, ...state.auditLogs] };
    }),
  stopTimer: (userId) =>
    set((state) => {
      const id = state.activeTimerByUser[userId] || null;
      if (!id) return {};
      const now = new Date().toISOString();
      const entries = state.timeEntries.map((e) => {
        if (e.id !== id || (e.status !== 'Running' && e.status !== 'Paused')) return e;
        let pauses = [...e.pauses];
        if (pauses.length > 0 && !pauses[pauses.length - 1].end) {
          pauses[pauses.length - 1] = { ...pauses[pauses.length - 1], end: now };
        }
        const startMs = new Date(e.startTs).getTime();
        const endMs = new Date(now).getTime();
        const pauseMs = pauses.reduce((acc, p) => {
          const ps = new Date(p.start).getTime();
          const pe = p.end ? new Date(p.end).getTime() : endMs;
          return acc + Math.max(0, pe - ps);
        }, 0);
        const totalSeconds = Math.max(0, Math.floor((endMs - startMs - pauseMs) / 1000));
        return { ...e, status: 'Stopped', endTs: now, pauses, totalSeconds, updates: [...e.updates, now] };
      });
      const entry = entries.find((e) => e.id === id)!;
      const minValid = entry.totalSeconds >= 60;
      const audit: AuditLog = {
        id: `audit-${Date.now()}`,
        action: 'TimeEntry Stop',
        entityId: id,
        entityType: 'Project',
        userId,
        timestamp: now,
        details: `Timer stopped, duration ${entry.totalSeconds}s`,
      };
      const nextActive = { ...state.activeTimerByUser, [userId]: null };
      const logs = [audit, ...state.auditLogs];
      return { timeEntries: entries, activeTimerByUser: nextActive, auditLogs: logs };
    }),
  tickTimer: (userId) =>
    set((state) => {
      const id = state.activeTimerByUser[userId] || null;
      if (!id) return {};
      const now = new Date().toISOString();
      const entries = state.timeEntries.map((e) => (e.id === id ? { ...e } : e));
      return { timeEntries: entries };
    }),
  addAuditLog: (log) => set((state) => ({ auditLogs: [log, ...state.auditLogs] })),
  updateUser: (user) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === user.id ? user : u)),
      currentUser: state.currentUser?.id === user.id ? user : state.currentUser,
    })),
  deleteUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),
    
  // Team Actions Implementation
  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  updateTeam: (id, updates) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTeam: (id) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== id),
    })),
  addTeamMember: (teamId, member) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, members: [...t.members, member] } : t
      ),
    })),
  removeTeamMember: (teamId, userId) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId
          ? { ...t, members: t.members.filter((m) => m.userId !== userId) }
          : t
      ),
    })),
  updateTeamMember: (teamId, userId, updates) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members: t.members.map((m) =>
                m.userId === userId ? { ...m, ...updates } : m
              ),
            }
          : t
      ),
    })),
    
  // New Hierarchy Actions Implementation
  addSubTeam: (teamId, subTeam) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, subTeams: [...(t.subTeams || []), subTeam] } : t
      ),
    })),
  updateSubTeam: (teamId, subTeamId, updates) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              subTeams: (t.subTeams || []).map((st) =>
                st.id === subTeamId ? { ...st, ...updates } : st
              ),
            }
          : t
      ),
    })),
  addSubTeamMember: (teamId, subTeamId, userId) =>
    set((state) => ({
      teams: state.teams.map((t) => {
        if (t.id !== teamId) return t;
        const subTeams = (t.subTeams || []).map((st) =>
          st.id === subTeamId
            ? {
                ...st,
                members: st.members.includes(userId)
                  ? st.members
                  : [...st.members, userId],
              }
            : st
        );
        return { ...t, subTeams };
      }),
    })),
  removeSubTeamMember: (teamId, subTeamId, userId) =>
    set((state) => ({
      teams: state.teams.map((t) => {
        if (t.id !== teamId) return t;
        const subTeams = (t.subTeams || []).map((st) =>
          st.id === subTeamId
            ? { ...st, members: st.members.filter((id) => id !== userId) }
            : st
        );
        return { ...t, subTeams };
      }),
    })),
  addUserStory: (story) => set((state) => ({ userStories: [...state.userStories, story] })),
  updateUserStory: (storyId, updates) =>
    set((state) => ({
      userStories: state.userStories.map((s) =>
        s.id === storyId ? { ...s, ...updates } : s
      ),
    })),
  deleteUserStory: (storyId) =>
    set((state) => ({
      userStories: state.userStories.filter((s) => s.id !== storyId),
    })),
  setUserStoryAcceptanceCriteria: (storyId, criteria) =>
    set((state) => ({
      userStories: state.userStories.map((s) =>
        s.id === storyId ? { ...s, acceptanceCriteria: criteria } : s
      ),
    })),
  addSprint: (sprint) =>
    set((state) => {
      const start = new Date(sprint.startDate);
      const end = new Date(sprint.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return { sprints: state.sprints };
      if (start > end) return { sprints: state.sprints };
      const project = state.projects.find((p) => p.id === sprint.projectId);
      if (!project) return { sprints: state.sprints };
      if (sprint.scope === 'Project') {
        if (sprint.parentProjectSprintId) return { sprints: state.sprints };
        if (sprint.moduleId) return { sprints: state.sprints };
        return { sprints: [...state.sprints, sprint] };
      }
      const mod = state.modules.find((m) => m.id === sprint.moduleId);
      if (!mod || mod.projectId !== sprint.projectId) return { sprints: state.sprints };
      const parent = sprint.parentProjectSprintId ? state.sprints.find((ps) => ps.id === sprint.parentProjectSprintId) : null;
      if (!parent) return { sprints: state.sprints };
      if (parent.projectId !== sprint.projectId) return { sprints: state.sprints };
      if (parent.moduleId) return { sprints: state.sprints };
      const pStart = new Date(parent.startDate);
      const pEnd = new Date(parent.endDate);
      if (start < pStart || end > pEnd) return { sprints: state.sprints };
      return { sprints: [...state.sprints, sprint] };
    }),
  updateSprint: (sprintId, updates) =>
    set((state) => {
      const existing = state.sprints.find((s) => s.id === sprintId);
      if (!existing) return { sprints: state.sprints };
      const next: Sprint = { ...existing, ...updates };
      const start = new Date(next.startDate);
      const end = new Date(next.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return { sprints: state.sprints };
      if (start > end) return { sprints: state.sprints };
      const project = state.projects.find((p) => p.id === next.projectId);
      if (!project) return { sprints: state.sprints };
      if (next.scope === 'Project') {
        if (next.parentProjectSprintId) return { sprints: state.sprints };
        if (next.moduleId) return { sprints: state.sprints };
      } else {
        const mod = state.modules.find((m) => m.id === next.moduleId);
        if (!mod || mod.projectId !== next.projectId) return { sprints: state.sprints };
        const parent = next.parentProjectSprintId ? state.sprints.find((ps) => ps.id === next.parentProjectSprintId) : null;
        if (!parent) return { sprints: state.sprints };
        if (parent.projectId !== next.projectId) return { sprints: state.sprints };
        if (parent.moduleId) return { sprints: state.sprints };
        const pStart = new Date(parent.startDate);
        const pEnd = new Date(parent.endDate);
        if (start < pStart || end > pEnd) return { sprints: state.sprints };
      }
      return {
        sprints: state.sprints.map((s) => (s.id === sprintId ? next : s)),
      };
    }),
}));
