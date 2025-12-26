"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { UserRole, DaySchedule, Skill, SkillLevel } from "@/types/schema";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { WeeklyAvailabilityEditor } from "@/components/WeeklyAvailabilityEditor";

const PREDEFINED_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "GraphQL",
  "PostgreSQL",
  "Prisma",
  "Docker",
  "AWS",
  "Figma",
  "SEO",
  "Content Writing",
  "Digital Marketing",
  "Project Management",
  "Agile",
  "Scrum",
  "Leadership",
  "Architecture",
];

const SKILL_LEVELS: SkillLevel[] = ["Entry", "Intermediate", "Advanced", "Expert"];

export default function UserDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { users, timeLogs, updateUser, currentUser, deleteUser } = useAppStore();
  
  const user = users.find((u) => u.id === id);
  const isAdmin = currentUser?.role === "Admin";
  const isSelf = currentUser?.id === id;
  const canEdit = isAdmin || isSelf;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user ? { ...user } : null);
  const [activeTab, setActiveTab] = useState<'profile' | 'timeslot'>('profile');
  const [newSkillName, setNewSkillName] = useState(PREDEFINED_SKILLS[0]);
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>("Entry");
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  if (!user || !editForm) {
    return <div className="p-6">User not found</div>;
  }

  // Calendar Logic
  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const startDayOfWeek = startOfMonth.day(); // 0 = Sunday
  const daysInMonth = currentMonth.daysInMonth();

  const calendarDays = useMemo(() => {
    const days = [];
    // Previous month padding
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: startOfMonth.subtract(startDayOfWeek - i, "day"), isCurrentMonth: false });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: startOfMonth.date(i), isCurrentMonth: true });
    }
    // Next month padding (to fill 42 grid cells - 6 weeks)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: endOfMonth.add(i, "day"), isCurrentMonth: false });
    }
    return days;
  }, [currentMonth, startOfMonth, endOfMonth, startDayOfWeek, daysInMonth]);

  const userLogs = timeLogs.filter((log) => log.userId === user.id);

  const getLogsForDate = (date: dayjs.Dayjs) => {
    return userLogs.filter((log) => dayjs(log.date).isSame(date, "day"));
  };

  const getTotalHoursForDate = (date: dayjs.Dayjs) => {
    return getLogsForDate(date).reduce((acc, log) => acc + log.hours, 0);
  };

  // Update User Handlers
  const handleSave = () => {
    if (editForm) {
      updateUser(editForm);
      setIsEditing(false);
    }
  };

  const handleAvailabilitySave = (newSchedule: DaySchedule[]) => {
    if (user) {
      const updatedUser = { ...user, weeklyAvailability: newSchedule };
      updateUser(updatedUser);
      // Also update local edit form if it's open
      setEditForm(updatedUser);
      alert("Availability updated successfully!");
    }
  };

  const addSkill = () => {
    if (newSkillName && newSkillLevel && editForm) {
      if (editForm.skills.some((s) => s.name === newSkillName)) {
        return; // Prevent duplicates
      }
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, { name: newSkillName, level: newSkillLevel }],
      });
    }
  };

  const removeSkill = (skillName: string) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        skills: editForm.skills.filter((s) => s.name !== skillName),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {user.name}
        </h1>
        <div className="space-x-2">
           <button
             onClick={() => router.back()}
             className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
           >
             Back
           </button>
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profile & Time Logs
          </button>
          <button
            onClick={() => setActiveTab('timeslot')}
            className={`${
              activeTab === 'timeslot'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Time-Slot Management
          </button>
        </nav>
      </div>

      {activeTab === 'timeslot' ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Time-Slot Management
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Define your standard working hours for each day of the week.
          </p>
          <WeeklyAvailabilityEditor
            initialSchedule={user.weeklyAvailability || []}
            onSave={handleAvailabilitySave}
            readOnly={!canEdit}
          />
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Profile Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Role</label>
                 {isEditing && isAdmin ? (
                   <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                   >
                     {[
                    "Admin",
                    "Manager",
                    "TeamLead",
                    "Coder",
                    "GraphicDesigner",
                    "CICDEngineer",
                    "SystemAnalyst",
                    "SEOExpert",
                    "DigitalMarketer",
                  ].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                   </select>
                 ) : (
                   <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                 )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Contract Hours</label>
                 {isEditing && isAdmin ? (
                   <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    value={editForm.contractHoursPerWeek}
                    onChange={(e) => setEditForm({ ...editForm, contractHoursPerWeek: Number(e.target.value) })}
                   />
                 ) : (
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.contractHoursPerWeek} hrs/week</p>
                 )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Skills</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {editForm.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                    >
                      {skill.name} <span className="ml-1 text-green-600 opacity-75 text-[10px]">({skill.level})</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeSkill(skill.name)}
                          className="ml-1.5 text-green-600 hover:text-green-800 focus:outline-none"
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex mt-3 space-x-2">
                    <select
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                    >
                      {PREDEFINED_SKILLS.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                    <select
                      className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                    >
                      {SKILL_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Time Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Time Calendar
                </h2>
                <div className="flex space-x-2">
                  <button onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    &lt;
                  </button>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {currentMonth.format("MMMM YYYY")}
                  </span>
                  <button onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    &gt;
                  </button>
                </div>
             </div>

             {/* Calendar Grid */}
             <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-50 dark:bg-gray-800 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
                {calendarDays.map((dayItem, index) => {
                  const hours = getTotalHoursForDate(dayItem.date);
                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] bg-white dark:bg-gray-800 p-2 border-t border-gray-100 dark:border-gray-700 ${
                        !dayItem.isCurrentMonth ? "bg-gray-50 dark:bg-gray-900 text-gray-400" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-xs ${dayItem.date.isSame(dayjs(), 'day') ? 'bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center' : ''}`}>
                          {dayItem.date.date()}
                        </span>
                        {hours > 0 && (
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 rounded">
                            {hours}h
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {getLogsForDate(dayItem.date).map(log => (
                          <div key={log.id} className="text-[10px] truncate text-gray-500 bg-gray-100 dark:bg-gray-700 rounded px-1" title={log.description}>
                            {log.description || "No description"}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
