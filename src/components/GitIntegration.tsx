"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";

export function GitIntegration({ projectId }: { projectId: string }) {
  const { projects, updateProject } = useAppStore();
  const project = projects.find((p) => p.id === projectId);
  const gitRepositoryUrl = project?.gitRepositoryUrl;

  const [activeTab, setActiveTab] = useState("branches");
  const [urlInput, setUrlInput] = useState("");

  // Mock Git Data (only shown if repo is configured)
  const branches = [
    { name: "main", lastCommit: "Initial commit", status: "Protected" },
    { name: "develop", lastCommit: "Added project modules", status: "Active" },
    { name: "feature/auth", lastCommit: " implemented JWT", status: "Active" },
    { name: "fix/login-bug", lastCommit: "Fixed z-index issue", status: "Stale" },
  ];

  const pullRequests = [
    { id: 101, title: "Feature: Time Tracking", author: "Jane Dev", status: "Open", reviewers: ["John Lead"] },
    { id: 102, title: "Fix: Navigation Mobile", author: "Mike Design", status: "Merged", reviewers: ["Jane Dev"] },
  ];

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      updateProject(projectId, { gitRepositoryUrl: urlInput.trim() });
    }
  };

  const handleDisconnect = () => {
    updateProject(projectId, { gitRepositoryUrl: null });
    setUrlInput("");
  };

  if (!gitRepositoryUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Connect Repository
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Link a Git repository to this project to enable version control features.
          </p>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Repository URL
              </label>
              <input
                type="text"
                id="repo-url"
                placeholder="https://github.com/username/repo.git"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Connect Repository
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="h-6 w-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.17 22 16.42 22 12A10 10 0 0012 2z" />
          </svg>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {gitRepositoryUrl}
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
        >
          Disconnect
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("branches")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "branches"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Branches
            </button>
            <button
              onClick={() => setActiveTab("prs")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "prs"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pull Requests
            </button>
            <button
              onClick={() => setActiveTab("automation")}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "automation"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Git Manager Agent
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "branches" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Active Branches</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {branches.map((branch) => (
                  <li key={branch.name} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-mono text-sm text-gray-700 dark:text-gray-300 font-semibold">{branch.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Last commit: {branch.lastCommit}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${branch.status === 'Protected' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                      {branch.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "prs" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pull Requests</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {pullRequests.map((pr) => (
                  <li key={pr.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">#{pr.id} {pr.title}</p>
                      <p className="text-xs text-gray-500 mt-1">by {pr.author} • Reviewers: {pr.reviewers.join(", ")}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${pr.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                      {pr.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "automation" && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-start space-x-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <h4 className="text-blue-800 dark:text-blue-300 font-medium mb-1">Automated Git Manager</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    The Git Manager Agent is monitoring <span className="font-mono font-semibold">{gitRepositoryUrl}</span>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg hover:border-blue-300 transition-colors">
                  <h5 className="font-medium mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Auto-Merge Policy
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enabled for feature branches passing CI</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg hover:border-yellow-300 transition-colors">
                  <h5 className="font-medium mb-2 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Conflict Resolution
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manual review required for core modules</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
