"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Project, TimeEntry } from "@/types/schema";

function formatHHMMSS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function TimeTracker() {
  const {
    currentUser,
    projects,
    timeEntries,
    activeTimerByUser,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tickTimer,
  } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [confirmStop, setConfirmStop] = useState<boolean>(false);
  const [idleWarning, setIdleWarning] = useState<string>("");
  const lastActivityRef = useRef<number>(Date.now());
  const [timerVisible, setTimerVisible] = useState<boolean>(true);

  const userId = currentUser?.id || "";
  const activeId = userId ? activeTimerByUser[userId] || null : null;
  const activeEntry = activeId ? (timeEntries.find((t) => t.id === activeId) as TimeEntry | undefined) : undefined;
  const isRunning = !!activeEntry && activeEntry.status === "Running";
  const isPaused = !!activeEntry && activeEntry.status === "Paused";

  useEffect(() => {
    const onActivity = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("keydown", onActivity);
    const idleCheck = setInterval(() => {
      if (isRunning) {
        const diff = Date.now() - lastActivityRef.current;
        if (diff > 10 * 60 * 1000) {
          setIdleWarning("No activity detected for 10 minutes. Pause timer?");
        } else {
          setIdleWarning("");
        }
      } else {
        setIdleWarning("");
      }
    }, 30000);
    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
      clearInterval(idleCheck);
    };
  }, [isRunning]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning && userId) tickTimer(userId);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, userId, tickTimer]);

  useEffect(() => {
    try {
      const snapshot = { timeEntries, activeTimerByUser };
      localStorage.setItem("__pb_time_snap__", JSON.stringify(snapshot));
    } catch {}
  }, [timeEntries, activeTimerByUser]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "__pb_time_snap__" && e.newValue) {
        // In a real app, we'd reconcile; for now, rely on central store
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const elapsedSeconds = useMemo(() => {
    if (!activeEntry) return 0;
    const startMs = new Date(activeEntry.startTs).getTime();
    const endMs = Date.now();
    const pauseMs = (activeEntry.pauses || []).reduce((acc, p) => {
      const ps = new Date(p.start).getTime();
      const pe = p.end ? new Date(p.end).getTime() : (activeEntry.status === "Paused" ? endMs : ps);
      return acc + Math.max(0, pe - ps);
    }, 0);
    const diff = Math.max(0, Math.floor((endMs - startMs - pauseMs) / 1000));
    return diff;
  }, [activeEntry]);

  const displaySeconds = activeEntry
    ? activeEntry.status === "Stopped"
      ? activeEntry.totalSeconds
      : elapsedSeconds
    : 0;

  const canControl = !!currentUser && currentUser.role !== "Manager";

  const start = () => {
    if (!canControl || !userId) return;
    if (!selectedProjectId) return;
    startTimer(userId, selectedProjectId, notes);
    setTimerVisible(true);
  };
  const pause = () => {
    if (!canControl || !userId) return;
    pauseTimer(userId);
    setTimerVisible(true);
  };
  const resume = () => {
    if (!canControl || !userId) return;
    resumeTimer(userId);
    setTimerVisible(true);
  };
  const stop = () => {
    if (!canControl || !userId) return;
    if (!confirmStop) {
      setConfirmStop(true);
      return;
    }
    stopTimer(userId);
    setConfirmStop(false);
    setTimerVisible(true);
  };

  const stateLabel = activeEntry ? (activeEntry.status === "Running" ? "Running" : activeEntry.status === "Paused" ? "Paused" : "Stopped") : "Stopped";

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
      {!activeEntry && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">Stopped</span>
            <span className="font-mono text-lg">{formatHHMMSS(0)}</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select Project</option>
              {projects.map((p: Project) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="text-xs rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 p-1"
            />
            <button
              onClick={start}
              className="px-3 py-1 rounded-md text-white bg-green-600 hover:bg-green-700 text-xs"
              disabled={!canControl || !selectedProjectId}
              title="Start timer (requires project selection)"
            >
              Start
            </button>
          </div>
        </div>
      )}
      {activeEntry && timerVisible && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded ${isRunning ? "bg-green-100 text-green-700" : isPaused ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
              {stateLabel}
            </span>
            <span className="font-mono text-lg">{formatHHMMSS(displaySeconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={pause}
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-xs"
              disabled={!canControl || !isRunning}
            >
              Pause
            </button>
            <button
              onClick={resume}
              className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs"
              disabled={!canControl || !isPaused}
            >
              Resume
            </button>
            <button
              onClick={stop}
              className={`px-3 py-1 rounded-md ${confirmStop ? "bg-red-700" : "bg-red-600"} hover:bg-red-700 text-white text-xs`}
              disabled={!canControl || !(isRunning || isPaused)}
              title="Finish timer and finalize entry"
            >
              {confirmStop ? "Confirm Finish" : "Finish"}
            </button>
          </div>
        </div>
      )}
      {activeEntry && !timerVisible && (
        <div className="flex items-center justify-end">
          <button
            onClick={stop}
            className={`px-3 py-1 rounded-md ${confirmStop ? "bg-red-700" : "bg-red-600"} hover:bg-red-700 text-white text-xs`}
            disabled={!canControl || !(isRunning || isPaused)}
            title="Finish timer and finalize entry"
          >
            {confirmStop ? "Confirm Finish" : "Finish"}
          </button>
        </div>
      )}
      {idleWarning && (
        <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
          {idleWarning}{" "}
          <button onClick={pause} className="ml-2 px-2 py-0.5 rounded bg-yellow-600 text-white text-xs">
            Pause
          </button>
        </div>
      )}
    </div>
  );
}
