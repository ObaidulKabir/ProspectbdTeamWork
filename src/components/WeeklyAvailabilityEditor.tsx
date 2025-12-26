"use client";

import { useState } from "react";
import { DaySchedule, TimeSlot } from "@/types/schema";

interface WeeklyAvailabilityEditorProps {
  initialSchedule: DaySchedule[];
  onSave: (schedule: DaySchedule[]) => void;
  readOnly?: boolean;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function WeeklyAvailabilityEditor({
  initialSchedule,
  onSave,
  readOnly = false,
}: WeeklyAvailabilityEditorProps) {
  // Ensure we always have 7 days
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    if (initialSchedule && initialSchedule.length === 7) {
      return initialSchedule;
    }

    // Generate default structure if missing or incomplete
    return DAYS.map((day) => {
      // Try to find existing data for this day
      const existing = initialSchedule?.find((d) => d.day === day);
      if (existing) return existing;
      
      // Default empty day
      return {
        day,
        isEnabled: false,
        slots: [],
      };
    });
  });
  
  const [error, setError] = useState<string | null>(null);

  const validateSchedule = (currentSchedule: DaySchedule[]): string | null => {
    for (const day of currentSchedule) {
      if (!day.isEnabled) continue;

      // Check for invalid times (start >= end)
      for (const slot of day.slots) {
        if (slot.start >= slot.end) {
          return `${day.day}: End time must be after start time (${slot.start} - ${slot.end})`;
        }
      }

      // Check for overlaps
      const sortedSlots = [...day.slots].sort((a, b) => a.start.localeCompare(b.start));
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        const current = sortedSlots[i];
        const next = sortedSlots[i + 1];
        if (current.end > next.start) {
          return `${day.day}: Overlapping slots detected (${current.start}-${current.end} and ${next.start}-${next.end})`;
        }
      }
    }
    return null;
  };

  const handleSave = () => {
    const validationError = validateSchedule(schedule);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSave(schedule);
  };

  const handleDayToggle = (dayIndex: number) => {
    if (readOnly) return;
    const newSchedule = [...schedule];
    newSchedule[dayIndex].isEnabled = !newSchedule[dayIndex].isEnabled;
    if (!newSchedule[dayIndex].isEnabled) {
      newSchedule[dayIndex].slots = [];
    } else if (newSchedule[dayIndex].slots.length === 0) {
      // Add default slot when enabling
      newSchedule[dayIndex].slots = [{ start: "09:00", end: "17:00" }];
    }
    setSchedule(newSchedule);
    setError(null);
  };

  const addSlot = (dayIndex: number) => {
    if (readOnly) return;
    const newSchedule = [...schedule];
    const currentSlots = newSchedule[dayIndex].slots;
    
    // Smart default: start after the last slot ends
    let newStart = "09:00";
    let newEnd = "17:00";
    
    if (currentSlots.length > 0) {
      const lastSlot = currentSlots[currentSlots.length - 1];
      // Simple logic: try to add 1 hour gap, then 1 hour duration
      // Parsing "HH:mm" is needed for real math, but simple string manipulation for now
      // Let's just default to a non-overlapping time if last slot ends before 23:00
      if (lastSlot.end < "23:00") {
         newStart = lastSlot.end;
         // Add 1 hour approx (this is naive string math, but sufficient for a default)
         const [h, m] = lastSlot.end.split(':').map(Number);
         const endH = Math.min(h + 1, 23);
         newEnd = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
         if (newStart === newEnd) { // if already 23:00
             newEnd = "23:59";
         }
      }
    }

    newSchedule[dayIndex].slots.push({ start: newStart, end: newEnd });
    setSchedule(newSchedule);
    setError(null);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    if (readOnly) return;
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.splice(slotIndex, 1);
    setSchedule(newSchedule);
    setError(null);
  };

  const updateSlot = (
    dayIndex: number,
    slotIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    if (readOnly) return;
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots[slotIndex][field] = value;
    setSchedule(newSchedule);
    setError(null);
  };

  const copyToAll = (dayIndex: number) => {
    if (readOnly) return;
    const sourceDay = schedule[dayIndex];
    if (!sourceDay.isEnabled) return;

    const newSchedule = schedule.map((day) => ({
      ...day,
      isEnabled: true,
      slots: sourceDay.slots.map((slot) => ({ ...slot })),
    }));
    setSchedule(newSchedule);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      {schedule.map((day, dayIndex) => (
        <div
          key={day.day}
          className={`p-4 border rounded-lg ${
            day.isEnabled
              ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-75"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={day.isEnabled}
                  onChange={() => handleDayToggle(dayIndex)}
                  disabled={readOnly}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
              <span className={`font-semibold text-lg ${day.isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {day.day}
              </span>
            </div>
            {!readOnly && (
              <div className="flex space-x-2">
                {day.isEnabled && (
                  <>
                    <button
                      onClick={() => copyToAll(dayIndex)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      title="Copy schedule to all days"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy All
                    </button>
                    <button
                      onClick={() => addSlot(dayIndex)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      title="Add time slot"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9V5a1 1 0 112 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4z" clipRule="evenodd" />
                      </svg>
                      Add Slot
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {day.isEnabled ? (
            <div className="pl-14 space-y-3">
              {day.slots.length === 0 ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => !readOnly && addSlot(dayIndex)}
                >
                  <p className="text-sm text-gray-500">No time slots configured.</p>
                  {!readOnly && <p className="text-xs text-blue-600 mt-1 font-medium">Click to add default hours (09:00 - 17:00)</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {day.slots.map((slot, slotIndex) => (
                    <div 
                      key={slotIndex} 
                      className="relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 overflow-hidden"
                    >
                      <div className="p-4 flex items-center justify-between">
                         <div className="flex-1 flex items-center space-x-2">
                           <div className="flex flex-col">
                             <label className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-0.5">Start</label>
                             <input
                               type="time"
                               value={slot.start}
                               onChange={(e) => updateSlot(dayIndex, slotIndex, "start", e.target.value)}
                               disabled={readOnly}
                               className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 w-24 transition-colors"
                             />
                           </div>
                           <div className="h-px w-4 bg-gray-300 dark:bg-gray-600 self-end mb-3"></div>
                           <div className="flex flex-col">
                             <label className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-0.5">End</label>
                             <input
                               type="time"
                               value={slot.end}
                               onChange={(e) => updateSlot(dayIndex, slotIndex, "end", e.target.value)}
                               disabled={readOnly}
                               className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 w-24 transition-colors"
                             />
                           </div>
                         </div>
                      </div>
                      {!readOnly && (
                        <button
                          onClick={() => removeSlot(dayIndex, slotIndex)}
                          className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Remove time slot"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      <div className="h-1 w-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="pl-14 py-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <span className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></span>
                Marked as Unavailable
              </div>
            </div>
          )}
        </div>
      ))}

      {!readOnly && (
        <div className="flex justify-end pt-4">
          <button
            onClick={() => onSave(schedule)}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
