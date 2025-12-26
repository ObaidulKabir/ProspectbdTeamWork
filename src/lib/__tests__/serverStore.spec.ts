import { serverStore } from "@/lib/serverStore";

describe("serverStore", () => {
  test("project CRUD and aggregate", () => {
    serverStore.addProject({
      id: "pX",
      name: "Proj X",
      description: "",
      managerId: "u1",
      teamLeadId: "u3",
      teamMemberIds: [],
      status: "Planning",
      startDate: "2024-01-01",
      assignedTeamId: null,
    });
    serverStore.addModule({ id: "mX", projectId: "pX", assignedSubTeamId: null, name: "Mod X", description: "", status: "Active" });
    serverStore.addStory({ id: "usX", moduleId: "mX", sprintId: null, title: "Story X", description: "", priority: "Medium", status: "Backlog", points: 3 });
    serverStore.addTask({ id: "tX", moduleId: "mX", userStoryId: "usX", title: "Task X", description: "", status: "ToDo", requiredSkills: [], estimatedHours: 5 });
    serverStore.addSprint({ id: "spX", projectId: "pX", moduleId: "mX", name: "Sprint X", startDate: "2024-01-01", endDate: "2024-01-14", status: "Planned", goal: "" });
    const agg = serverStore.getProjectAggregate("pX");
    expect(agg.project?.id).toBe("pX");
    expect(agg.modules.length).toBe(1);
    expect(agg.userStories.length).toBe(1);
    expect(agg.tasks.length).toBe(1);
    expect(agg.sprints.length).toBe(1);
  });

  test("sprintSummaryByProject", () => {
    const summary = serverStore.sprintSummaryByProject("pX");
    expect(summary.sprintsCount).toBeGreaterThanOrEqual(1);
    expect(summary.tasksTotal).toBeGreaterThanOrEqual(1);
  });
});
