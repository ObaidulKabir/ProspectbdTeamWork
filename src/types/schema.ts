export type UserRole =
  | 'Admin'
  | 'Manager'
  | 'TeamLead'
  | 'Coder'
  | 'GraphicDesigner'
  | 'CICDEngineer'
  | 'SystemAnalyst'
  | 'SEOExpert'
  | 'DigitalMarketer';

export type SkillLevel = 'Entry' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface TimeSlot {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface DaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isEnabled: boolean;
  slots: TimeSlot[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  contractHoursPerWeek: number;
  availableHours: number;
  skills: Skill[];
  timezone: string;
  weeklyAvailability: DaySchedule[];
}

export interface AuditLog {
  id: string;
  action: string;
  entityId: string;
  entityType: 'Project' | 'Team' | 'User' | 'Module' | 'SubTeam';
  userId: string; // Who performed the action
  timestamp: string;
  details: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hours: number;
  description: string;
}

export type TimeEntryStatus = 'Running' | 'Paused' | 'Stopped';
export interface PauseSegment {
  start: string;
  end?: string;
}
export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  startTs: string;
  endTs?: string;
  totalSeconds: number;
  pauses: PauseSegment[];
  notes?: string;
  status: TimeEntryStatus;
  updates: string[];
}

export type TaskStatus = 'Backlog' | 'ToDo' | 'InProgress' | 'Review' | 'Done';

export type TaskLevel = 'Project' | 'Module' | 'UserStory';

export interface Task {
  id: string;
  moduleId: string;
  userStoryId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string;
  requiredSkills: string[];
  estimatedHours: number;
  actualHours?: number;
  dependencyIds?: string[];
  sprintId?: string | null;
  taskLevel?: TaskLevel;
}

export interface Module {
  id: string;
  projectId: string;
  assignedSubTeamId?: string | null; // New assignment
  name: string;
  description: string;
  status: 'Active' | 'Completed' | 'OnHold';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  managerId: string;
  teamLeadId: string;
  teamMemberIds: string[];
  status: 'Planning' | 'Design' | 'Implementation' | 'Testing' | 'Deployment' | 'Completed';
  startDate: string;
  endDate?: string;
  gitRepositoryUrl?: string | null;
  assignedTeamId?: string | null;
}

export interface TeamMember {
  userId: string;
  role: string; // e.g. "Member", "Lead"
  joinDate: string;
  status: 'Active' | 'Inactive';
}

export interface SubTeam {
  id: string;
  teamId: string;
  name: string;
  description: string;
  leadId: string | null;
  members: string[]; // userIds
}

export interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'Active' | 'Inactive';
  leadId: string | null;
  members: TeamMember[];
  subTeams: SubTeam[];
}

export type SprintScope = 'Project' | 'Module';

export interface Sprint {
  id: string;
  projectId: string;
  moduleId?: string | null;
  parentProjectSprintId?: string | null;
  scope: SprintScope;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed';
  goal: string;
}

export interface UserStory {
  id: string;
  moduleId: string;
  sprintId?: string | null;
  title: string;
  description: string;
  acceptanceCriteria?: string[];
  priority: 'High' | 'Medium' | 'Low';
  status: 'Backlog' | 'ToDo' | 'InProgress' | 'Done';
  points: number;
}

// (Removed duplicate Task and Module interfaces)
