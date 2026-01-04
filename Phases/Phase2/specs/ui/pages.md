# UI Pages

## Page Structure

### Welcome Page
- **Route**: `/`
- **Access**: Public (unauthenticated users only)
- **Purpose**: Landing page for new visitors
- **Components**:
  - Hero section with app title
  - Feature highlights
  - "Get Started" CTA button
  - Link to sign in
- **Behavior**:
  - Redirects to `/app` if user is authenticated

### Login Page
- **Route**: `/login`
- **Access**: Public (unauthenticated users only)
- **Purpose**: User authentication
- **Components**:
  - LoginForm
  - Link to signup
  - App branding
- **Behavior**:
  - Redirects to `/app` on successful login
  - Shows error toast on failure

### Signup Page
- **Route**: `/signup`
- **Access**: Public (unauthenticated users only)
- **Purpose**: User registration
- **Components**:
  - SignupForm
  - Link to login
  - App branding
- **Behavior**:
  - Redirects to `/app` on successful registration
  - Shows error toast on failure

### Main App Page
- **Route**: `/app`
- **Access**: Protected (authenticated users only)
- **Purpose**: Task management dashboard
- **Layout**: AppLayout with Sidebar
- **Components**:
  - Header with search and add task button
  - TaskList
  - TaskDialog (modal)
- **Features**:
  - View all tasks
  - Filter by status/priority/date
  - Search tasks
  - Create new tasks
  - Edit existing tasks
  - Delete tasks
  - Mark tasks complete
- **Behavior**:
  - Redirects to `/login` if not authenticated
  - Fetches tasks on mount
  - Real-time updates on CRUD operations

## Routing

### Route Protection
- Protected routes check authentication status
- Unauthenticated users redirected to `/login`
- Authenticated users on public routes redirected to `/app`

### Navigation Flow
```
/ (Welcome) ──┬──> /login ──> /app
              │
              └──> /signup ──> /app

/app ──> / (on logout)
```

## URL Parameters

### Filter Parameters (on /app)
- `?status=pending` - Show pending tasks only
- `?status=completed` - Show completed tasks only
- `?priority=high` - Show high priority tasks
- `?priority=medium` - Show medium priority tasks
- `?priority=low` - Show low priority tasks
- `?filter=today` - Show tasks due today
- `?filter=upcoming` - Show tasks due in next 7 days
- `?search=query` - Search tasks by title/description

## Responsive Design

### Desktop (1024px+)
- Fixed sidebar (280px width)
- Full task cards with all details
- Side-by-side layout

### Tablet (768px - 1023px)
- Collapsible sidebar
- Condensed task cards
- Modal dialogs

### Mobile (< 768px)
- Hidden sidebar with hamburger toggle
- Full-width task cards
- Bottom sheet dialogs
- Touch-friendly buttons
