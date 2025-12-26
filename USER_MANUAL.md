# ProspectBD TeamWork - User Manual

## 1. Introduction
Welcome to **ProspectBD TeamWork**, a comprehensive Software Development Life Cycle (SDLC) management system. This platform is designed to facilitate collaboration among cross-functional teams, including Coders, Managers, Designers, and QA Engineers. It streamlines project tracking, time management, task assignment, and Git integration.

---

## 2. Getting Started

### 2.1 Accessing the System
- **URL**: Navigate to the deployed application URL (or `http://localhost:3000` for local development).
- **Dashboard**: Upon loading, you will see the main Dashboard, which provides an overview of your assigned tasks and project status.

### 2.2 User Roles & Permissions
The system supports multiple roles. Your access level determines what you can see and do:
- **Admin**: Full access to all settings, user management, and project creation.
- **Manager**: Can create projects, assign teams, and view all reports.
- **Team Lead**: Manages specific projects, assigns tasks, and reviews code.
- **Coder/Designer/QA**: Focuses on assigned tasks, time logging, and status updates.

> **Note**: For this demo version, you can switch between users (e.g., Admin, Coder, Team Lead) using the dropdown menu in the bottom-left corner of the sidebar.

---

## 3. Dashboard Overview
The **Dashboard** is your central hub:
- **Stats Grid**: Displays key metrics like "Assigned Tasks," "Active Projects," and "Hours Logged."
- **My Tasks**: A list of tasks specifically assigned to you. Click on a task to view details.
- **Project Overview**: A summary of active projects and their current status (e.g., Planning, Implementation).

---

## 4. Project Management

### 4.1 Viewing Projects
1. Click **Projects** in the sidebar.
2. You will see a grid of all active projects with their descriptions and status tags.

### 4.2 Creating a New Project (Admin/Manager Only)
1. Navigate to the **Projects** page.
2. Click the **"New Project"** button (top right).
3. Enter the **Project Name** and click **Create**.
4. The project will appear in the list with a "Planning" status.

### 4.3 Managing Tasks (Kanban Board)
1. Click on any project card to open its **Kanban Board**.
2. **Columns**:
   - **Backlog**: New tasks waiting to be picked up.
   - **To Do**: Tasks ready for work.
   - **In Progress**: Tasks currently being worked on.
   - **Review**: Tasks completed and awaiting peer review.
   - **Done**: Verified and completed tasks.
3. **Adding a Task**:
   - Scroll to the bottom of the "Backlog" column.
   - Type the task title in the input field and press Enter.
4. **Moving Tasks**:
   - Use the **arrow buttons (← / →)** on a task card to move it between columns.
5. **Changing Task Level (Project → Module → User Story)**:
   - Each task has a level indicator (Project/Module/User Story) shown on its card.
   - Use the **Move to Module** dropdown to attach the task to a module.
   - Use the **Move to Story** dropdown to attach the task to a user story (its module is set automatically).
   - If the task’s sprint conflicts (e.g., module-scoped sprint from a different module), sprint is cleared to preserve consistency.
   - Only Admin, Manager, or Team Lead can change a task’s level.
   - Reference: [projects page](file:///c:/Users/HP/Documents/trae_projects/ProspectbdTeamWork/src/app/projects/%5Bid%5D/page.tsx#L873-L902)

---

## 5. Time Tracking
Time tracking is available on the project page header and supports real-time timers with pause/resume history and reporting.

### 5.1 Real-Time Timer
- **Start**: Select a project and click **Start**. The timer hides but continues running in the background. The **Finish** button appears.
- **Pause**: Pauses the timer and shows the timer view with the current elapsed time preserved (never resets).
- **Resume**: Resumes the timer and hides the timer view again.
- **Finish**: Stops the timer and records final duration with pause segments. A short confirmation is required.
- **Notes**: Optional description field saved with the time entry at start.
- **Idle Prompt**: If no user activity is detected for 10 minutes while running, an inline prompt offers to pause.
- **Validation**:
  - Requires project selection before **Start**.
  - Prevents overlapping timers (one active per user).
  - Minimum 1-minute entries are required for summary reporting.
- Reference: [TimeTracker](file:///c:/Users/HP/Documents/trae_projects/ProspectbdTeamWork/src/components/TimeTracker.tsx)

### 5.2 Time Entries Data
- Each time entry contains:
  - Start timestamp, end timestamp, total duration (seconds)
  - Project association and notes
  - Pause segments with start/end timestamps
  - Status: Running/Paused/Stopped
  - Audit log entries for start/pause/resume/finish
- References:
  - Schema: [schema.ts](file:///c:/Users/HP/Documents/trae_projects/ProspectbdTeamWork/src/types/schema.ts#L61-L76)
  - Store: [store.ts](file:///c:/Users/HP/Documents/trae_projects/ProspectbdTeamWork/src/lib/store.ts#L212-L335)

### 5.3 Reports
- Navigate to **Project → Analytics** to view time reports.
- Switch ranges: Today, This Week, This Month.
- Metrics include total hours, entry count, projects tracked, and daily availability usage.
- Export options:
  - **CSV**: Exports the table rows with projects and durations.
  - **PDF**: Use the browser print dialog (Print to PDF).
- Reference: [TimeReports](file:///c:/Users/HP/Documents/trae_projects/ProspectbdTeamWork/src/components/TimeReports.tsx)

---

## 6. Git Integration

### 6.1 Connecting a Repository
1. Click **Git Integration** in the sidebar.
2. If no repository is connected, you will see a connection form.
3. Enter the full HTTPS URL of your Git repository (e.g., `https://github.com/my-org/my-project.git`).
4. Click **Connect Repository**.

### 6.2 Using Git Features
Once connected, you will see three tabs:
- **Branches**: Lists active branches with their status (e.g., Protected, Active, Stale) and last commit message.
- **Pull Requests**: Shows open and merged pull requests, including reviewers and authors.
- **Git Manager Agent**: Displays the status of automated agents handling auto-merges and conflict resolution policies.

### 6.3 Disconnecting
- To switch repositories, click the **"Disconnect"** button in the top-right corner of the Git Integration page.

---

## 7. Task Management (My Tasks)
1. Click **Tasks** in the sidebar.
2. This view aggregates **all tasks assigned to you** across different projects.
3. Use this list to quickly see what needs your immediate attention without navigating through individual project boards.

---

## 8. Troubleshooting
- **"Unable to connect to Git"**: Ensure the URL is correct and public (or you have appropriate access tokens configured in a real deployment).
- **"Permission Denied"**: Check your current role in the sidebar. Switch to "Admin" if you need to create projects.
- **Display Issues**: Try refreshing the page. The app uses local state for this demo, so a hard refresh might reset mock data.

---

## 9. Support
For technical issues or feature requests, please contact the System Administrator or log a ticket in the "Support" project board.

---

## 10. Sprints & Hierarchy

### 10.1 Sprint Attachment & Containment
- Sprints have explicit **scope**: Project or Module.
- **Project-level sprint**: scope=Project, moduleId=null, no parent sprint.
- **Module-level sprint**: scope=Module, moduleId set, must reference a parent project sprint. Dates must be fully contained within the parent sprint.
- References:
  - Model: [schema.ts: Sprint](file:///c:/Users/HP/Documents/trae_projects/ProspectbdTeamWork/src/types/schema.ts#L128-L137)
  - Creation/Update validation: [store.ts](file:///c:/Users/HP/Documents/trae_projects/ProspectbdTeamWork/src/lib/store.ts#L328-L334), [serverStore.ts](file:///c:/Users/HP/Documents/trae_projects/ProspectbdTeamWork/src/lib/serverStore.ts#L123-L175)

### 10.2 Task Level Rules
- Tasks can be created at **Project**, **Module**, or **User Story** levels.
- Without sprint selection, tasks created from the project board default to **Project** level.
- Selecting a sprint attaches tasks to the sprint’s level (Project or Module).
- Moving tasks:
  - Project → Module via **Move to Module**
  - Module → User Story via **Move to Story**
  - Sprint consistency enforced; invalid sprint associations are cleared.
- Role restriction: Only **Admin/Manager/TeamLead** can change levels.
- Reference: [projects page](file:///c:/Users/HP/Documents/trae_projects/ProspectbdTeamWork/src/app/projects/%5Bid%5D/page.tsx#L873-L902)

### 10.3 Board Filtering
- Module filter on the project board shows:
  - Tasks directly assigned to the module
  - Tasks under the module’s user stories
  - Tasks in sprints attached to the module
- Sprint filter shows tasks linked by sprint directly or via user story inheritance.
- Reference: [project board filters](file:///c:/Users/HP/Documents/trae_projects/ProspectbdTeamWork/src/app/projects/%5Bid%5D/page.tsx#L87-L109)
