# FitsiteGonga - System Architecture Document

## Overview

FitsiteGonga is a strength training tracking application built with Next.js 14, Supabase, and TypeScript. The system has been reworked from a challenge-based fitness app to a comprehensive strength training platform focused on workout logging, progress tracking, and goal management.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Custom components with Discord-inspired styling

## Database Schema

### Core Tables

#### `profiles`

```sql
- id: UUID (Primary Key, references auth.users)
- display_name: TEXT
- bio: TEXT
- birthdate: DATE
- gender: TEXT
- unit_system: TEXT ('metric' | 'imperial')
- role: TEXT ('client' | 'trainer' | 'admin')
- training_prefs: JSONB
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `movements`

```sql
- id: UUID (Primary Key)
- key: TEXT (Unique identifier)
- name: TEXT
- category: movement_category ENUM
- primary_muscles: TEXT[]
- secondary_muscles: TEXT[]
- default_equipment: equipment_type ENUM
- is_bodyweight: BOOLEAN
- created_at: TIMESTAMPTZ
```

#### `exercises`

```sql
- id: UUID (Primary Key)
- movement_id: UUID (Foreign Key to movements)
- variation: TEXT
- name: TEXT
- media_url: TEXT
```

#### `workout_sessions`

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to profiles)
- started_at: TIMESTAMPTZ
- ended_at: TIMESTAMPTZ
- title: TEXT
- notes: TEXT
```

#### `session_exercises`

```sql
- id: UUID (Primary Key)
- session_id: UUID (Foreign Key to workout_sessions)
- exercise_id: UUID (Foreign Key to exercises)
- order_index: INT
```

#### `exercise_sets`

```sql
- id: UUID (Primary Key)
- session_exercise_id: UUID (Foreign Key to session_exercises)
- set_index: INT
- weight_kg: NUMERIC(6,2)
- reps: INT
- rpe: NUMERIC(3,1)
- tempo: TEXT
- duration_sec: INT
- distance_m: NUMERIC(8,2)
- est_1rm_kg: NUMERIC(6,2) (Auto-calculated)
- tonnage_kg: NUMERIC(10,2) (Auto-calculated)
- notes: TEXT
- performed_at: TIMESTAMPTZ
```

#### `lift_goals`

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to profiles)
- movement_id: UUID (Foreign Key to movements)
- target_1rm_kg: NUMERIC(6,2)
- target_weight_kg: NUMERIC(6,2)
- target_reps: INT
- due_date: DATE
- created_at: TIMESTAMPTZ
```

### Views

#### `v_user_prs`

```sql
SELECT
  s.user_id,
  m.id AS movement_id,
  m.name AS movement_name,
  MAX(es.est_1rm_kg) AS best_1rm_kg,
  MAX(es.performed_at) AS last_performed_at
FROM workout_sessions s
JOIN session_exercises se ON se.session_id = s.id
JOIN exercise_sets es ON es.session_exercise_id = se.id
JOIN exercises e ON e.id = se.exercise_id
JOIN movements m ON m.id = e.movement_id
WHERE es.est_1rm_kg IS NOT NULL
GROUP BY s.user_id, m.id, m.name
```

## Application Architecture

### Route Structure

```
src/app/
├── (app)/                    # Protected routes (requires auth)
│   ├── layout.tsx           # Auth guard & profile completion check
│   ├── page.tsx             # Dashboard
│   ├── account-setup/       # Multi-step profile setup
│   ├── workouts/            # Workout logging
│   └── metrics/             # Progress tracking
├── auth/                    # Authentication routes
└── api/                     # API endpoints
    ├── movements/           # Movement catalog
    ├── exercises/           # Exercise variations
    ├── workouts/            # Session management
    ├── sets/                # Set logging
    ├── lift-goals/          # Goal management
    └── prs/                 # Personal records
```

### Component Architecture

```
src/components/
├── auth/                    # Authentication components
├── layout/                  # Layout components (Sidebar, Header)
├── workouts/                # Workout-specific components
│   ├── SessionLogger.tsx
│   ├── ExercisePicker.tsx
│   ├── ExerciseCard.tsx
│   ├── SetRow.tsx
│   └── WorkoutHistory.tsx
└── metrics/                 # Metrics components
    ├── PRCard.tsx
    ├── GoalProgress.tsx
    └── VolumeChart.tsx
```

### State Management

#### Zustand Stores

**`useWorkoutStore`**

- Active session management
- Exercise and set logging
- Real-time 1RM calculations

**`useLiftsStore`**

- Movement and exercise catalog
- Personal records
- Lift goals management

### Key Features

#### 1. Account Setup Flow

- **Step 1**: Profile information (name, bio, birthdate, gender, units)
- **Step 2**: Fitness metrics (height, weight, heart rate, activity level)
- **Step 3**: Training preferences (favorite movements, frequency, 1RM formula)

#### 2. Workout Logging

- Start/end workout sessions
- Add exercises from movement catalog
- Log sets with weight, reps, RPE
- Automatic 1RM calculation using multiple formulas
- Real-time tonnage calculation

#### 3. Progress Tracking

- Personal records per movement
- Goal setting and progress visualization
- Training volume analytics
- Historical workout data

#### 4. Dashboard

- Top personal records display
- Active goals with progress bars
- Recent workouts summary
- Quick action buttons

## Security & Data Access

### Row Level Security (RLS)

All user-specific tables implement RLS policies:

- **Workout Sessions**: Users can only access their own sessions
- **Exercise Sets**: Users can only access sets from their own sessions
- **Lift Goals**: Users can only access their own goals
- **Movements/Exercises**: Public read access for catalog data

### Authentication Flow

1. User signs up/in via Supabase Auth
2. Profile completion guard checks if setup is complete
3. Redirects to account setup if incomplete
4. Redirects to dashboard if complete

## API Endpoints

### REST API Structure

| Endpoint               | Method           | Purpose                      |
| ---------------------- | ---------------- | ---------------------------- |
| `/api/movements`       | GET              | Fetch movement catalog       |
| `/api/exercises`       | GET              | Fetch exercise variations    |
| `/api/workouts`        | GET, POST        | List/create workout sessions |
| `/api/workouts/[id]`   | GET, PUT, DELETE | Manage specific session      |
| `/api/sets`            | POST             | Log exercise sets            |
| `/api/sets/[id]`       | PUT, DELETE      | Update/delete sets           |
| `/api/lift-goals`      | GET, POST        | Manage lift goals            |
| `/api/lift-goals/[id]` | PUT, DELETE      | Update/delete goals          |
| `/api/prs`             | GET              | Fetch personal records       |

## Data Flow

### Workout Logging Flow

1. User starts new workout session
2. Adds exercises from movement catalog
3. Logs sets with weight/reps/RPE
4. System auto-calculates 1RM and tonnage
5. Data stored with proper relationships
6. PRs updated via database triggers

### Progress Tracking Flow

1. User sets lift goals for specific movements
2. System tracks current PRs via view
3. Progress calculated as percentage of goal
4. Dashboard displays visual progress indicators

## Current Status & Next Steps

### ✅ Completed Features

- **Database schema with proper relationships**: Implemented in `supabase/migrations/20250119_account_setup.sql` with 8 core tables, foreign key constraints, and cascade deletes
- **Account setup flow with training preferences**: 3-step process in `src/app/(app)/account-setup/page.tsx` with Zod validation in `src/schema/account-setup.ts`
- **Workout logging system with real-time calculations**: Zustand store in `src/lib/state/workoutStore.ts` with automatic 1RM calculations via database triggers
- **Progress tracking and goal management**: Lift goals stored in `lift_goals` table with progress calculated in `src/components/metrics/GoalProgress.tsx`
- **Personal records system**: Database view `v_user_prs` aggregates best 1RM per movement from `exercise_sets` table
- **Dashboard with training-focused content**: `src/app/(app)/page.tsx` fetches PRs, goals, and recent workouts via parallel API calls
- **API endpoints for all core functionality**: 8 REST endpoints in `src/app/api/` with authentication middleware and RLS validation
- **Row Level Security implementation**: Policies in SQL migration ensure users can only access their own workout data

### 🔄 In Progress

- **UI styling and visual polish**: Components use basic Tailwind classes, need Discord color scheme implementation
- **Discord-inspired design system implementation**: Color variables defined in CSS but not consistently applied across components
- **Component library standardization**: Individual component styling in place, needs centralized theme system

### 📋 Next Steps

1. **Visual Design System**
   - Replace basic Tailwind classes with Discord-themed color variables in component files
   - Create centralized theme configuration in `tailwind.config.js` with Discord color palette
   - Add framer-motion animations to existing components in `src/components/`

2. **Enhanced Features**
   - Add workout templates table to database schema and create template selection UI
   - Implement social sharing via Supabase real-time subscriptions for workout feeds
   - Create advanced analytics dashboard with Chart.js integration for volume trends
   - Add responsive breakpoints to existing Tailwind classes in all component files

3. **Performance & UX**
   - Add database indexes for frequently queried fields in workout_sessions and exercise_sets tables
   - Implement React Query caching in `src/lib/state/` stores for API responses
   - Add service worker for offline workout logging capability
   - Configure PWA manifest in `next.config.js` for mobile app-like experience

## Current Implementation Status

### ✅ Completed Features (Week 1 Cleanup)

1. **Authentication & Profile Setup**
   - Supabase authentication integration
   - 3-step account setup flow (`src/app/(app)/account-setup/page.tsx`)
   - Profile completion guard in `src/app/(app)/layout.tsx`
   - Form validation with Zod schemas
   - Role-based access control (client/trainer/admin)

2. **Training Domain (Fully Implemented)**
   - Movements and exercises management (`src/app/api/movements/`, `src/app/api/exercises/`)
   - Workout session logging (`src/app/api/workouts/`)
   - Exercise set tracking with tonnage calculation (`src/app/api/sets/`)
   - Personal records (PRs) tracking (`src/app/api/prs/`)
   - Lift goals management (`src/app/api/lift-goals/`)
   - Training volume analytics (`src/app/api/volume/`)

3. **Dashboard & Metrics (Real Data)**
   - Main dashboard with PRs, goals, and recent workouts (`src/app/(app)/page.tsx`)
   - Metrics page with charts and analytics (`src/app/(app)/metrics/page.tsx`)
   - Volume chart with real Supabase data (no more mock data)
   - Empty states and loading states
   - Goals page with coming soon placeholder (`src/app/(app)/goals/page.tsx`)

4. **Public Landing Page**
   - Professional landing page with hero section (`src/app/page.tsx`)
   - Feature highlights and call-to-action
   - Responsive design with smooth scrolling

5. **Code Quality**
   - TypeScript strict mode enabled
   - ESLint errors fixed
   - Dead code removed (duplicate dashboard deleted)
   - User table conflicts resolved (profiles table as single source)

### 📋 Planned Features (Week 2-4)

1. **Challenge System** (Week 2)
   - Challenge creation and management
   - Join/leave challenge functionality
   - Progress logging for challenges
   - Challenge participant management

2. **Personal Goals** (Week 2)
   - Fitness goals CRUD operations
   - Visual progress tracking
   - Goal completion celebrations

3. **Social Features** (Week 3)
   - Progress reactions and comments
   - Achievement display and notifications
   - Community features and encouragement

4. **Testing & Polish** (Week 4)
   - Unit and integration tests
   - Performance optimization
   - Mobile responsiveness
   - Final deployment

## Development Notes

### Code Quality

- TypeScript for type safety
- Zod for runtime validation
- Consistent error handling
- Proper separation of concerns

### Testing Strategy

- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows

### Deployment

- Vercel for frontend hosting
- Supabase for backend services
- Environment-based configuration
- Automated CI/CD pipeline

---

_Last Updated: January 2025_
_Version: 2.0.0 (Training Domain Rework)_
