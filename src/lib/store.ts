import { create } from 'zustand';
import { User, Project, Module, Task, TimeLog, UserRole, DaySchedule, Team, TeamMember } from '@/types/schema';

interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  modules: Module[];
  tasks: Task[];
  timeLogs: TimeLog[];
  teams: Team[];

  // Actions
  setCurrentUser: (user: User | null) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  addProject: (project: Project) => void;
  addModule: (module: Module) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  updateTaskAssignee: (taskId: string, assigneeId: string | undefined) => void;
  logTime: (log: TimeLog) => void;
  
  // Team Actions
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  addTeamMember: (teamId: string, member: TeamMember) => void;
  removeTeamMember: (teamId: string, userId: string) => void;
  updateTeamMember: (teamId: string, userId: string, updates: Partial<TeamMember>) => void;
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
  },
];

export const useAppStore = create<AppState>((set) => ({
  currentUser: MOCK_USERS[0], // Default logged in as Admin
  users: MOCK_USERS,
  projects: MOCK_PROJECTS,
  modules: [],
  tasks: [],
  timeLogs: [],
  teams: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updates } : p
      ),
    })),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  addModule: (module) => set((state) => ({ modules: [...state.modules, module] })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),
  updateTaskAssignee: (taskId, assigneeId) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, assigneeId } : t)),
    })),
  logTime: (log) => set((state) => ({ timeLogs: [...state.timeLogs, log] })),
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
}));
