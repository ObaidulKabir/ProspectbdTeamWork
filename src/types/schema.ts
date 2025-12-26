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

export interface TimeLog {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hours: number;
  description: string;
}

export type TaskStatus = 'Backlog' | 'ToDo' | 'InProgress' | 'Review' | 'Done';

export interface Task {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string;
  requiredSkills: string[];
  estimatedHours: number;
}

export interface Module {
  id: string;
  projectId: string;
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
  status: 'Planning' | 'Design' | 'Implementation' | 'Testing' | 'Deployment';
  startDate: string;
  endDate?: string;
  gitRepositoryUrl?: string | null;
}

export interface TeamMember {
  userId: string;
  role: string; // e.g. "Member", "Lead"
  joinDate: string;
  status: 'Active' | 'Inactive';
}

export interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'Active' | 'Inactive';
  leadId: string | null;
  members: TeamMember[];
}
