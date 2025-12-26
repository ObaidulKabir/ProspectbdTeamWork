# ProspectBD TeamWork - SDLC Management System

## Overview
Comprehensive software development life cycle (SDLC) management system built with Next.js 14, TypeScript, and Tailwind CSS. This system supports cross-functional team collaboration, time tracking, project management, and role-based access control.

## Features

### 1. User Roles & Permissions
- **Roles**: Admin, Manager, TeamLead, Coder, GraphicDesigner, CICDEngineer, SystemAnalyst, SEOExpert, DigitalMarketer.
- **Access Control**: Role-based routing and visibility (e.g., only Admins can manage users, only assigned Coders see tasks).

### 2. Time Management
- **Time Logging**: Users can log hours against specific projects.
- **Tracking**: Real-time logging of hours (Mocked).

### 3. Project Management
- **Projects**: Create and manage projects with status (Planning -> Deployment).
- **Kanban Board**: Drag-and-drop style task management (Backlog -> Done).
- **Task Assignment**: Assign tasks to team members.

### 4. Git Integration (Mocked)
- **Dashboard**: View active branches and pull requests.
- **Automation**: Placeholders for automated code reviews and merge conflict resolution.

## Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React (Planned) / Text Fallback

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Directory Structure
- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions and Zustand store.
- `src/types`: TypeScript interfaces and types.

## Development Process
Follows a phased approach:
1. **Planning**: Requirements gathering (Completed).
2. **Design**: Wireframes and Architecture (Completed).
3. **Implementation**: Incremental builds (In Progress).
4. **Testing**: Automated tests via Jest/Playwright (Setup).
5. **Deployment**: CI/CD Pipeline integration.

## License
Private
