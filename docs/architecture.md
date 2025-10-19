# FitsiteGonga System Architecture

## Tech Stack Overview

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with Discord-inspired dark theme
- **Components**: Custom Discord-themed component library
- **State Management**: Zustand for global state, React Hook Form for forms
- **Animation**: Framer Motion for smooth transitions
- **Real-time**: Supabase Realtime subscriptions

### Backend

- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (OAuth + email/password)
- **API**: Next.js API routes + Supabase client
- **Real-time**: Supabase Realtime for live updates
- **Storage**: Supabase Storage for progress photos

### Development Tools

- **Testing**: Vitest (unit), Playwright (E2E), Testing Library
- **Linting**: ESLint + Prettier
- **Type Safety**: TypeScript with strict mode
- **Documentation**: Storybook for components

## Database Schema

### Core Tables

#### Profiles (extends Supabase Auth)

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL, -- References auth.users(id)
  display_name text,
  avatar_url text,
  bio text,
  gender text CHECK (gender = ANY (ARRAY['male', 'female', 'nonbinary', 'prefer_not'])),
  birthdate date,
  unit_system text NOT NULL DEFAULT 'metric' CHECK (unit_system = ANY (ARRAY['metric', 'imperial'])),
  season text NOT NULL DEFAULT 'reset' CHECK (season = ANY (ARRAY['reset', 'build', 'challenge'])),
  role text NOT NULL DEFAULT 'client' CHECK (role = ANY (ARRAY['client', 'trainer', 'admin'])),
  training_prefs jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

#### Fitness Metrics

```sql
CREATE TABLE public.fitness_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  weight_kg numeric,
  height_cm numeric,
  body_fat_percent numeric,
  resting_hr integer,
  max_hr integer,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fitness_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT fitness_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

#### Movements

```sql
CREATE TABLE public.movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  category movement_category NOT NULL DEFAULT 'compound',
  primary_muscles text[] DEFAULT ARRAY[]::text[],
  secondary_muscles text[] DEFAULT ARRAY[]::text[],
  default_equipment equipment_type NOT NULL DEFAULT 'barbell',
  is_bodyweight boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT movements_pkey PRIMARY KEY (id)
);
```

#### Exercises

```sql
CREATE TABLE public.exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  movement_id uuid NOT NULL,
  variation text DEFAULT '',
  name text NOT NULL,
  media_url text,
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_movement_id_fkey FOREIGN KEY (movement_id) REFERENCES public.movements(id)
);
```

#### Workout Sessions

```sql
CREATE TABLE public.workout_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  title text,
  notes text,
  CONSTRAINT workout_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT workout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

#### Session Exercises

```sql
CREATE TABLE public.session_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  CONSTRAINT session_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT session_exercises_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.workout_sessions(id),
  CONSTRAINT session_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);
```

#### Exercise Sets

```sql
CREATE TABLE public.exercise_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_exercise_id uuid NOT NULL,
  set_index integer NOT NULL DEFAULT 1,
  weight_kg numeric,
  reps integer,
  rpe numeric,
  tempo text,
  duration_sec integer,
  distance_m numeric,
  est_1rm_kg numeric,
  tonnage_kg numeric,
  notes text,
  performed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exercise_sets_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_sets_session_exercise_id_fkey FOREIGN KEY (session_exercise_id) REFERENCES public.session_exercises(id)
);
```

#### Lift Goals

```sql
CREATE TABLE public.lift_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  movement_id uuid NOT NULL,
  target_1rm_kg numeric,
  target_weight_kg numeric,
  target_reps integer,
  due_date date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lift_goals_pkey PRIMARY KEY (id),
  CONSTRAINT lift_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT lift_goals_movement_id_fkey FOREIGN KEY (movement_id) REFERENCES public.movements(id)
);
```

#### Measurement History

```sql
CREATE TABLE public.measurement_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  measure_date date NOT NULL DEFAULT (now())::date,
  weight_kg numeric,
  body_fat_percent numeric,
  waist_cm numeric,
  hips_cm numeric,
  chest_cm numeric,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT measurement_history_pkey PRIMARY KEY (id),
  CONSTRAINT measurement_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

### TypeScript Interfaces

#### Profile

```typescript
interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'nonbinary' | 'prefer_not';
  birthdate?: string;
  unit_system: 'metric' | 'imperial';
  season: 'reset' | 'build' | 'challenge';
  role: 'client' | 'trainer' | 'admin';
  training_prefs: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

#### Workout Session

```typescript
interface WorkoutSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  title?: string;
  notes?: string;
}
```

#### Exercise Set

```typescript
interface ExerciseSet {
  id: string;
  session_exercise_id: string;
  set_index: number;
  weight_kg?: number;
  reps?: number;
  rpe?: number;
  tempo?: string;
  duration_sec?: number;
  distance_m?: number;
  est_1rm_kg?: number;
  tonnage_kg?: number;
  notes?: string;
  performed_at: string;
}
```

#### Lift Goal

```typescript
interface LiftGoal {
  id: string;
  user_id: string;
  movement_id: string;
  target_1rm_kg?: number;
  target_weight_kg?: number;
  target_reps?: number;
  due_date?: string;
  created_at: string;
}
```

## Current Implementation Status

### ✅ Completed Features

#### Authentication & Profile Setup

- Supabase authentication integration (`src/lib/supabase.ts`)
- 3-step account setup flow (`src/app/(app)/account-setup/page.tsx`)
- Profile completion guard in `src/app/(app)/layout.tsx`
- Form validation with Zod schemas (`src/schema/account-setup.ts`)
- Role-based access control (client/trainer/admin)

#### Training Domain (Fully Implemented)

- Movements and exercises management (`src/app/api/movements/`, `src/app/api/exercises/`)
- Workout session logging (`src/app/api/workouts/`)
- Exercise set tracking with tonnage calculation (`src/app/api/sets/`)
- Personal records (PRs) tracking (`src/app/api/prs/`)
- Lift goals management (`src/app/api/lift-goals/`)
- Training volume analytics (`src/app/api/volume/`)

#### Dashboard & Metrics (Real Data)

- Main dashboard with PRs, goals, and recent workouts (`src/app/(app)/page.tsx`)
- Metrics page with charts and analytics (`src/app/(app)/metrics/page.tsx`)
- Volume chart with real Supabase data
- Empty states and loading states
- Goals page with functional goal tracker (`src/app/(app)/goals/page.tsx`)

#### Functional Components

- Workout logger with exercises and sets (`src/components/workouts/WorkoutLogger.tsx`)
- Goal tracker with progress visualization (`src/components/goals/GoalTracker.tsx`)
- Challenge creation and management (`src/components/challenges/`)
- Progress logging and feed (`src/components/progress/`)

#### Public Landing Page

- Professional landing page with hero section (`src/app/page.tsx`)
- Feature highlights and call-to-action
- Responsive design with smooth scrolling

### 📋 Planned Features (Next Development Phase)

#### Challenge System Integration

- Connect challenge components to real Supabase data
- Implement challenge creation API endpoints
- Add real-time challenge updates
- Build challenge participant management

#### Data Persistence

- Connect workout logger to Supabase
- Implement goal tracking persistence
- Add progress logging to database
- Build analytics with real data

#### Social Features

- Progress reactions and comments
- Achievement system
- Community features
- Real-time notifications

## API Endpoints

### Training Domain

- `GET /api/movements` - Fetch all movements
- `GET /api/exercises` - Fetch exercises by movement
- `GET /api/workouts` - Fetch user workout sessions
- `POST /api/workouts` - Create new workout session
- `GET /api/workouts/[id]` - Fetch specific workout
- `PUT /api/workouts/[id]` - Update workout session
- `POST /api/sets` - Log exercise set
- `PUT /api/sets/[id]` - Update exercise set
- `DELETE /api/sets/[id]` - Delete exercise set
- `GET /api/prs` - Fetch user personal records
- `GET /api/lift-goals` - Fetch user lift goals
- `POST /api/lift-goals` - Create lift goal
- `PUT /api/lift-goals/[id]` - Update lift goal
- `DELETE /api/lift-goals/[id]` - Delete lift goal
- `GET /api/volume` - Fetch training volume data

### Legacy Challenge System (To be integrated)

- `GET /api/challenges` - Fetch challenges
- `POST /api/challenges` - Create challenge
- `GET /api/progress` - Fetch progress logs
- `POST /api/progress` - Log progress

## Component Architecture

### Layout Components

#### AppLayout (`src/app/(app)/layout.tsx`)

- Main application layout with sidebar and header
- Profile completion guard logic
- Loading and error states

#### Sidebar (`src/components/layout/Sidebar.tsx`)

- Navigation between main sections
- Discord-inspired design
- Active route highlighting

#### Header (`src/components/layout/Header.tsx`)

- User menu and sign out
- App branding
- Responsive design

### Feature Components

#### Workout Logger (`src/components/workouts/WorkoutLogger.tsx`)

- Interactive workout tracking
- Exercise and set management
- Real-time progress tracking

#### Goal Tracker (`src/components/goals/GoalTracker.tsx`)

- Goal creation and management
- Progress visualization
- Goal completion tracking

#### Challenge System (`src/components/challenges/`)

- Challenge creation modal
- Challenge cards with join/leave
- Progress logging and feed

## Security & Authentication

### Row Level Security (RLS)

- All tables have RLS policies
- User data isolation
- Role-based access control

### Authentication Flow

1. User signs in via Supabase Auth
2. Profile completion check
3. Redirect to appropriate page
4. Protected routes require authentication

## Development Guidelines

### Code Organization

- Feature-based folder structure
- Shared components in `/components`
- API routes in `/api`
- Types in `/types`
- Utilities in `/lib`

### State Management

- Local component state for UI
- Zustand for global state (when needed)
- Supabase for server state
- React Hook Form for forms

### Testing Strategy

- Unit tests with Vitest
- Component tests with Testing Library
- E2E tests with Playwright
- API route testing
