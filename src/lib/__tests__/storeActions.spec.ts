import { useAppStore } from "@/lib/store";

describe("Store actions", () => {
  test("setTaskDependencies updates task", () => {
    const s = useAppStore.getState();
    s.addTask({
      id: "t-dep",
      moduleId: "m1",
      userStoryId: "us1",
      title: "Task with deps",
      description: "",
      status: "Backlog",
      requiredSkills: [],
      estimatedHours: 1,
    });
    s.setTaskDependencies("t-dep", ["a", "b"]);
    const t = useAppStore.getState().tasks.find((x) => x.id === "t-dep");
    expect(t?.dependencyIds).toEqual(["a", "b"]);
  });

  test("setTaskActualHours updates task", () => {
    const s = useAppStore.getState();
    s.addTask({
      id: "t-hrs",
      moduleId: "m1",
      userStoryId: "us1",
      title: "Task hours",
      description: "",
      status: "Backlog",
      requiredSkills: [],
      estimatedHours: 2,
    });
    s.setTaskActualHours("t-hrs", 3);
    const t = useAppStore.getState().tasks.find((x) => x.id === "t-hrs");
    expect(t?.actualHours).toBe(3);
  });

  test("addSubTeamMember and removeSubTeamMember", () => {
    const s = useAppStore.getState();
    s.addTeam({
      id: "team1",
      name: "Alpha",
      description: "",
      createdAt: new Date().toISOString(),
      status: "Active",
      leadId: null,
      members: [],
      subTeams: [{ id: "st1", teamId: "team1", name: "A-1", description: "", leadId: null, members: [] }],
    });
    s.addSubTeamMember("team1", "st1", "u2");
    let st = useAppStore.getState().teams.find((t) => t.id === "team1")?.subTeams.find((x) => x.id === "st1");
    expect(st?.members).toContain("u2");
    s.removeSubTeamMember("team1", "st1", "u2");
    st = useAppStore.getState().teams.find((t) => t.id === "team1")?.subTeams.find((x) => x.id === "st1");
    expect(st?.members).not.toContain("u2");
  });
});
