"use client";
import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { TimeEntry } from "@/types/schema";

function secondsToH(totalSeconds: number) {
  return (totalSeconds / 3600).toFixed(2);
}

function toCSV(rows: Array<Record<string, any>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (val: any) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(",")].concat(rows.map((r) => headers.map((h) => esc(r[h])).join(",")));
  return lines.join("\n");
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
}
function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0);
}
function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6, 23, 59, 59);
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

export function TimeReports({ projectId }: { projectId?: string }) {
  const { timeEntries, currentUser, projects } = useAppStore();
  const [range, setRange] = useState<"day" | "week" | "month">("day");
  const now = new Date();
  const rangeStart = range === "day" ? startOfDay(now) : range === "week" ? startOfWeek(now) : startOfMonth(now);
  const rangeEnd = range === "day" ? endOfDay(now) : range === "week" ? endOfWeek(now) : endOfMonth(now);

  const entries = useMemo(() => {
    return timeEntries.filter((e: TimeEntry) => {
      if (projectId && e.projectId !== projectId) return false;
      if (currentUser?.role === "Manager") {
        return true;
      }
      if (currentUser?.id && e.userId !== currentUser.id) return false;
      const st = new Date(e.startTs).getTime();
      const en = new Date(e.endTs || e.startTs).getTime();
      const inRange = st >= rangeStart.getTime() && en <= rangeEnd.getTime();
      return inRange && e.totalSeconds >= 60;
    });
  }, [timeEntries, currentUser, projectId, rangeStart, rangeEnd]);

  const totalSeconds = entries.reduce((acc, e) => acc + e.totalSeconds, 0);
  const byProject: Record<string, number> = {};
  entries.forEach((e) => {
    byProject[e.projectId] = (byProject[e.projectId] || 0) + e.totalSeconds;
  });

  const exportCSV = () => {
    const rows = entries.map((e) => ({
      id: e.id,
      project: projects.find((p) => p.id === e.projectId)?.name || e.projectId,
      userId: e.userId,
      startTs: e.startTs,
      endTs: e.endTs || "",
      totalSeconds: e.totalSeconds,
      notes: e.notes || "",
      status: e.status,
    }));
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time-report-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    window.print();
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Reports</h3>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button onClick={exportCSV} className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-xs">
            Export CSV
          </button>
          <button onClick={printPDF} className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-xs">
            Export PDF
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Total Hours</div>
          <div className="text-2xl font-semibold">{secondsToH(totalSeconds)}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Entries</div>
          <div className="text-2xl font-semibold">{entries.length}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Projects Tracked</div>
          <div className="text-2xl font-semibold">{Object.keys(byProject).length}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Availability Used Today</div>
          <div className="text-2xl font-semibold">
            {range === "day" && currentUser ? `${secondsToH(totalSeconds)} / ${(currentUser.contractHoursPerWeek / 5).toFixed(2)} h` : "-"}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2">Project</th>
              <th className="py-2">Start</th>
              <th className="py-2">End</th>
              <th className="py-2">Hours</th>
              <th className="py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td className="py-2 text-gray-500" colSpan={5}>
                  No entries in selected range.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="py-2">{projects.find((p) => p.id === e.projectId)?.name || e.projectId}</td>
                  <td className="py-2">{new Date(e.startTs).toLocaleString()}</td>
                  <td className="py-2">{e.endTs ? new Date(e.endTs).toLocaleString() : "-"}</td>
                  <td className="py-2">{secondsToH(e.totalSeconds)}</td>
                  <td className="py-2">{e.notes || ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
