"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { DaySchedule } from "@/types/schema";
import Link from "next/link";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export default function TeamCalendarPage() {
  const { users } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<string>("All");

  const roles = ["All", ...Array.from(new Set(users.map((u) => u.role)))];

  const filteredUsers =
    selectedRole === "All"
      ? users
      : users.filter((u) => u.role === selectedRole);

  // Helper to check if a user is working at a specific hour
  const isWorkingAt = (schedule: DaySchedule[], day: string, hour: number) => {
    if (!schedule) return false;
    const daySchedule = schedule.find((d) => d.day === day);
    if (!daySchedule || !daySchedule.isEnabled) return false;

    return daySchedule.slots.some((slot) => {
      // Parse HH:mm to get start and end times in decimal hours for comparison
      const [startH, startM] = slot.start.split(":").map(Number);
      const [endH, endM] = slot.end.split(":").map(Number);
      
      const slotStart = startH + startM / 60;
      const slotEnd = endH + endM / 60;
      
      // Check if the current hour block (e.g., 9:00 to 10:00) overlaps with the slot
      // We consider the block "active" if there is any overlap
      const blockStart = hour;
      const blockEnd = hour + 1;

      return Math.max(slotStart, blockStart) < Math.min(slotEnd, blockEnd);
    });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Team Availability Calendar
        </h1>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Role:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
           <div className="overflow-x-auto">
             {DAYS.map((day) => (
               <div key={day} className="mb-8">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 sticky left-0 bg-white dark:bg-gray-800">
                   {day}
                 </h3>
                 <div className="min-w-max">
                   {/* Header Row (Hours) */}
                   <div className="flex">
                     <div className="w-48 flex-shrink-0 p-2 font-medium text-gray-500 bg-gray-50 dark:bg-gray-700 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-600">
                       Team Member
                     </div>
                     {hours.map((hour) => (
                       <div
                         key={hour}
                         className="w-8 flex-shrink-0 text-center text-xs text-gray-500 border-l border-gray-100 dark:border-gray-700"
                       >
                         {hour}
                       </div>
                     ))}
                   </div>

                   {/* User Rows */}
                   {filteredUsers.map((user) => (
                     <div
                       key={user.id}
                       className="flex border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                     >
                       <div className="w-48 flex-shrink-0 p-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-600 truncate">
                         <Link href={`/users/${user.id}`} className="hover:text-blue-600">
                           {user.name}
                         </Link>
                         <div className="text-xs text-gray-500">{user.role}</div>
                       </div>
                       {hours.map((hour) => {
                         const isWorking = isWorkingAt(
                           user.weeklyAvailability,
                           day,
                           hour
                         );
                         return (
                           <div
                             key={hour}
                             className={`w-8 flex-shrink-0 border-l border-gray-100 dark:border-gray-700 h-10 ${
                               isWorking
                                 ? "bg-green-200 dark:bg-green-900"
                                 : ""
                             }`}
                             title={isWorking ? `${user.name}: Working` : ""}
                           />
                         );
                       })}
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
