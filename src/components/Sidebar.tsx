"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { UserRole } from "@/types/schema";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Tasks", href: "/tasks" },
  { name: "Time Logs", href: "/time-logs" },
  { name: "Team Calendar", href: "/calendar" },
];

const ADMIN_ITEMS = [
  { name: "User Management", href: "/users" },
  { name: "Team Management", href: "/teams" },
  { name: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, users, setCurrentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            TeamWork
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            SDLC Management
          </p>
        </div>
      </aside>
    );
  }

  const NAV_ITEMS_WITH_PROFILE = [
    ...NAV_ITEMS,
    { name: "My Profile", href: currentUser ? `/users/${currentUser.id}` : "#" },
  ];

  const handleUserSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const user = users.find((u) => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const isAdmin = currentUser?.role === "Admin";

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          TeamWork
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          SDLC Management
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS_WITH_PROFILE.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block px-4 py-2 rounded-md text-sm font-medium ${
              pathname === item.href
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {item.name}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Admin
              </p>
            </div>
            {ADMIN_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {currentUser?.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentUser?.role}
          </p>
        </div>
        <select
          className="w-full mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
          value={currentUser?.id || ""}
          onChange={handleUserSwitch}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              Switch to {u.name} ({u.role})
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
