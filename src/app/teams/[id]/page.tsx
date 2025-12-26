"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { TeamMember, User } from "@/types/schema";
import Link from "next/link";

export default function TeamDetailsPage() {
  const params = useParams();
  const teamId = params.id as string;
  const router = useRouter();
  const { teams, users, currentUser, updateTeam, deleteTeam, addTeamMember, removeTeamMember, updateTeamMember, addSubTeam, updateSubTeam, addSubTeamMember, removeSubTeamMember } = useAppStore();

  const team = teams.find((t) => t.id === teamId);
  const isAdmin = currentUser?.role === "Admin";

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingSubTeam, setIsAddingSubTeam] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Member");
  const [newSubTeamName, setNewSubTeamName] = useState("");
  const [newSubTeamDescription, setNewSubTeamDescription] = useState("");
  const [manageSubTeamId, setManageSubTeamId] = useState<string | null>(null);
  const [selectedSubTeamUserId, setSelectedSubTeamUserId] = useState<string>("");

  if (!team) {
    return <div className="p-6">Team not found</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Access Denied. Only Admins can manage teams.</p>
      </div>
    );
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    if (team.members.some((m) => m.userId === selectedUserId)) {
      alert("User is already a member of this team.");
      return;
    }

    const newMember: TeamMember = {
      userId: selectedUserId,
      role: selectedRole,
      joinDate: new Date().toISOString(),
      status: "Active",
    };

    addTeamMember(team.id, newMember);
    setIsAddingMember(false);
    setSelectedUserId("");
  };

  const handleAddSubTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTeamName.trim()) return;

    const newSubTeam: any = { // Using any temporarily as imported type might not be updated in this file's context yet
      id: `st-${Date.now()}`,
      teamId: team.id,
      name: newSubTeamName,
      description: newSubTeamDescription,
      leadId: null,
      members: [],
    };

    addSubTeam(team.id, newSubTeam);
    setIsAddingSubTeam(false);
    setNewSubTeamName("");
    setNewSubTeamDescription("");
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeTeamMember(team.id, userId);
      // If the removed member was the lead, clear the leadId
      if (team.leadId === userId) {
        updateTeam(team.id, { leadId: null });
      }
    }
  };

  const handlePromoteToLead = (userId: string) => {
    if (confirm("Promote this member to Team Lead? This will replace the current lead.")) {
      updateTeam(team.id, { leadId: userId });
      // Also update their role in the team member list to 'Lead' for clarity
      updateTeamMember(team.id, userId, { role: "Lead" });
      
      // Optionally demote previous lead if needed, but for now just updating the new one is enough
    }
  };

  const handleAddMemberToSubTeam = (e: React.FormEvent, subTeamId: string) => {
    e.preventDefault();
    if (!selectedSubTeamUserId) return;
    addSubTeamMember(team.id, subTeamId, selectedSubTeamUserId);
    setSelectedSubTeamUserId("");
  };

  const handleRemoveMemberFromSubTeam = (subTeamId: string, userId: string) => {
    if (confirm("Remove this member from sub-team?")) {
      removeSubTeamMember(team.id, subTeamId, userId);
    }
  };

  const handleDeleteTeam = () => {
    if (confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      deleteTeam(team.id);
      router.push("/teams");
    }
  };

  const availableUsers = users.filter(
    (u) => !team.members.some((m) => m.userId === u.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {team.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {team.description}
          </p>
        </div>
        <div className="space-x-2">
          <Link
            href="/teams"
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            Back
          </Link>
          <button
            onClick={handleDeleteTeam}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Delete Team
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Sub-Teams
          </h3>
          <button
            onClick={() => setIsAddingSubTeam(!isAddingSubTeam)}
            className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {isAddingSubTeam ? "Cancel" : "Add Sub-Team"}
          </button>
        </div>

        {isAddingSubTeam && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleAddSubTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sub-Team Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  value={newSubTeamName}
                  onChange={(e) => setNewSubTeamName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  value={newSubTeamDescription}
                  onChange={(e) => setNewSubTeamDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {(team.subTeams || []).length === 0 ? (
            <li className="px-4 py-4 text-center text-sm text-gray-500">
              No sub-teams created yet.
            </li>
          ) : (
            team.subTeams.map((subTeam) => {
              const availableSubTeamUsers = team.members
                .map(tm => tm.userId)
                .filter(uid => !subTeam.members.includes(uid));
              return (
                <li key={subTeam.id} className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{subTeam.name}</h4>
                      <p className="text-xs text-gray-500">{subTeam.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {subTeam.members.length} members
                      </span>
                      <button
                        onClick={() => setManageSubTeamId(manageSubTeamId === subTeam.id ? null : subTeam.id)}
                        className="text-xs px-2 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        {manageSubTeamId === subTeam.id ? "Close" : "Manage Members"}
                      </button>
                    </div>
                  </div>
                  {manageSubTeamId === subTeam.id && (
                    <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                      <form onSubmit={(e) => handleAddMemberToSubTeam(e, subTeam.id)} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Add Team Member
                          </label>
                          <select
                            value={selectedSubTeamUserId}
                            onChange={(e) => setSelectedSubTeamUserId(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="">Choose member...</option>
                            {availableSubTeamUsers.map((uid) => {
                              const u = users.find(us => us.id === uid);
                              if (!u) return null;
                              return <option key={uid} value={uid}>{u.name}</option>;
                            })}
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Add
                        </button>
                      </form>
                      <div className="mt-3">
                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Members</h5>
                        {subTeam.members.length === 0 ? (
                          <p className="text-xs text-gray-500">No members in this sub-team.</p>
                        ) : (
                          <ul className="space-y-2">
                            {subTeam.members.map(uid => {
                              const u = users.find(us => us.id === uid);
                              if (!u) return null;
                              return (
                                <li key={uid} className="flex items-center justify-between">
                                  <span className="text-xs text-gray-800 dark:text-gray-200">{u.name}</span>
                                  <button
                                    onClick={() => handleRemoveMemberFromSubTeam(subTeam.id, uid)}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Team Members
          </h3>
          <button
            onClick={() => setIsAddingMember(!isAddingMember)}
            className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {isAddingMember ? "Cancel" : "Add Member"}
          </button>
        </div>

        {isAddingMember && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleAddMember} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="">Choose a user...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Member">Member</option>
                  <option value="Lead">Lead</option>
                  <option value="Observer">Observer</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Add
              </button>
            </form>
          </div>
        )}

        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {team.members.length === 0 ? (
            <li className="px-4 py-4 text-center text-sm text-gray-500">
              No members yet.
            </li>
          ) : (
            team.members.map((member) => {
              const user = users.find((u) => u.id === member.userId);
              const isLead = team.leadId === member.userId;

              if (!user) return null;

              return (
                <li key={member.userId} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        {user.name}
                        {isLead && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Team Lead
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email} • {member.role} • Joined {new Date(member.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!isLead && (
                      <button
                        onClick={() => handlePromoteToLead(member.userId)}
                        className="text-xs text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Promote to Lead
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="text-xs text-red-600 hover:text-red-900 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
