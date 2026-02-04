# UI Components

## Component Library
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Layout Components

### AppLayout
Main application layout with sidebar.
- **Location**: `src/components/layout/app-layout.tsx`
- **Props**: `children`
- **Features**:
  - Responsive sidebar navigation
  - Mobile hamburger menu
  - User profile display

### Sidebar
Navigation sidebar with filters.
- **Location**: `src/components/layout/sidebar.tsx`
- **Features**:
  - App logo and title
  - Filter links (All, Today, Upcoming, Completed)
  - Priority filters (High, Medium, Low)
  - User profile with sign out

## Task Components

### TaskCard
Individual task display card.
- **Location**: `src/components/tasks/task-card.tsx`
- **Props**: `task`, `onEdit`, `onDelete`, `onToggleComplete`
- **Features**:
  - Checkbox for completion toggle
  - Priority badge (color-coded)
  - Due date display
  - Edit/Delete action buttons
  - Visual styling for completed tasks (strikethrough, muted)

### TaskForm
Form for creating/editing tasks.
- **Location**: `src/components/tasks/task-form.tsx`
- **Props**: `task?`, `onSubmit`, `onCancel`
- **Fields**:
  - Title (required, text input)
  - Description (optional, textarea)
  - Priority (select: low/medium/high)
  - Due date (date picker)
- **Validation**:
  - Title required, 1-200 characters
  - Description max 1000 characters

### TaskList
Container for task cards.
- **Location**: `src/components/tasks/task-list.tsx`
- **Props**: `tasks`, `onEdit`, `onDelete`, `onToggleComplete`
- **Features**:
  - Maps tasks to TaskCard components
  - Empty state message
  - Loading skeleton

### TaskDialog
Modal dialog for task form.
- **Location**: `src/components/tasks/task-dialog.tsx`
- **Props**: `open`, `onOpenChange`, `task?`, `onSubmit`
- **Features**:
  - Create/Edit mode based on task prop
  - Form validation
  - Cancel and submit buttons

## Auth Components

### LoginForm
User login form.
- **Location**: `src/components/auth/login-form.tsx`
- **Fields**: Email, Password
- **Features**:
  - Form validation
  - Error display
  - Link to signup

### SignupForm
User registration form.
- **Location**: `src/components/auth/signup-form.tsx`
- **Fields**: Name, Email, Password
- **Features**:
  - Form validation
  - Password requirements
  - Link to login

## Common Components

### SearchInput
Search bar for filtering tasks.
- **Location**: `src/components/common/search-input.tsx`
- **Features**:
  - Debounced search
  - Clear button
  - Search icon

### PriorityBadge
Color-coded priority indicator.
- **Location**: Part of TaskCard
- **Colors**:
  - High: Red/destructive
  - Medium: Yellow/warning
  - Low: Green/secondary

### Toast Notifications
User feedback notifications.
- **Provider**: sonner
- **Types**: Success, Error, Info
- **Usage**: Task CRUD operations, auth events

## Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in dialogs
- Screen reader friendly
