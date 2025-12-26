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

---

## 5. Time Tracking

### 5.1 Logging Time
1. Click **Time Logs** in the sidebar.
2. In the "Log Time" form:
   - **Project**: Select the project you worked on.
   - **Hours**: Enter the duration (e.g., 2.5).
   - **Description**: Briefly describe the work done (e.g., "Fixed login bug").
3. Click **Submit Time Log**.

### 5.2 Viewing History
- Your recent logs are displayed below the form in the **Recent Logs** section, showing the date, project, and hours logged.

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
