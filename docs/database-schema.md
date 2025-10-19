# FitsiteGonga Database Schema

## Overview

This document describes the complete database schema for FitsiteGonga, a Discord-inspired fitness tracking platform. The schema is designed to support comprehensive workout tracking, goal management, and social features.

## Schema Design Principles

1. **User-Centric**: All data is organized around user profiles
2. **Normalized**: Proper foreign key relationships and data integrity
3. **Extensible**: JSONB fields for flexible data storage
4. **Secure**: Row Level Security (RLS) on all tables
5. **Performance**: Indexed fields for common queries

## Core Tables

### Profiles

**Purpose**: User profile information extending Supabase Auth

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

**Key Features**:

- Extends Supabase Auth users
- Role-based access control (client/trainer/admin)
- Training preferences stored as JSONB
- Seasonal training phases

### Fitness Metrics

**Purpose**: Current user fitness measurements

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

**Key Features**:

- One record per user (UNIQUE constraint)
- Metric and imperial unit support
- Automatic timestamp updates

### Measurement History

**Purpose**: Historical tracking of body measurements

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

**Key Features**:

- Historical body measurements
- Multiple measurement types
- Date-based tracking

## Training Domain

### Movements

**Purpose**: Base movement patterns (e.g., Squat, Bench Press)

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

**Key Features**:

- Unique key for programmatic access
- Muscle group targeting
- Equipment requirements
- Bodyweight flag

### Exercises

**Purpose**: Specific exercise variations of movements

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

**Key Features**:

- Links to base movement
- Variation description
- Media support for demonstrations

### Workout Sessions

**Purpose**: Individual workout sessions

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

**Key Features**:

- Session timing tracking
- User ownership
- Optional title and notes

### Session Exercises

**Purpose**: Exercises performed in a workout session

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

**Key Features**:

- Links sessions to exercises
- Order tracking for workout flow

### Exercise Sets

**Purpose**: Individual sets within an exercise

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

**Key Features**:

- Comprehensive set tracking
- 1RM estimation
- Tonnage calculation
- RPE (Rate of Perceived Exertion)
- Support for different exercise types

### Lift Goals

**Purpose**: User-defined strength goals

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

**Key Features**:

- Links to movements
- Flexible goal types (1RM, weight, reps)
- Target dates

## Data Relationships

```
profiles (1) ←→ (1) fitness_metrics
profiles (1) ←→ (*) measurement_history
profiles (1) ←→ (*) workout_sessions
profiles (1) ←→ (*) lift_goals

movements (1) ←→ (*) exercises
movements (1) ←→ (*) lift_goals

workout_sessions (1) ←→ (*) session_exercises
exercises (1) ←→ (*) session_exercises
session_exercises (1) ←→ (*) exercise_sets
```

## Enums and Types

### Movement Categories

```sql
CREATE TYPE movement_category AS ENUM (
  'compound',
  'isolation',
  'cardio',
  'flexibility',
  'plyometric'
);
```

### Equipment Types

```sql
CREATE TYPE equipment_type AS ENUM (
  'barbell',
  'dumbbell',
  'kettlebell',
  'cable',
  'machine',
  'bodyweight',
  'resistance_band',
  'medicine_ball'
);
```

## Indexes

### Performance Indexes

```sql
-- User data queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_fitness_metrics_user_id ON fitness_metrics(user_id);
CREATE INDEX idx_measurement_history_user_date ON measurement_history(user_id, measure_date);

-- Workout queries
CREATE INDEX idx_workout_sessions_user_started ON workout_sessions(user_id, started_at);
CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);
CREATE INDEX idx_exercise_sets_session_exercise ON exercise_sets(session_exercise_id);
CREATE INDEX idx_exercise_sets_performed_at ON exercise_sets(performed_at);

-- Goal queries
CREATE INDEX idx_lift_goals_user ON lift_goals(user_id);
CREATE INDEX idx_lift_goals_due_date ON lift_goals(due_date);

-- Movement queries
CREATE INDEX idx_movements_key ON movements(key);
CREATE INDEX idx_exercises_movement ON exercises(movement_id);
```

## Row Level Security (RLS)

### Profiles

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Fitness Metrics

```sql
-- Users can only access their own metrics
CREATE POLICY "Users can manage own metrics" ON fitness_metrics
  FOR ALL USING (auth.uid() = user_id);
```

### Workout Data

```sql
-- Users can only access their own workout data
CREATE POLICY "Users can manage own workouts" ON workout_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own session exercises" ON session_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = session_exercises.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own exercise sets" ON exercise_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM session_exercises se
      JOIN workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = exercise_sets.session_exercise_id
      AND ws.user_id = auth.uid()
    )
  );
```

## Helper Functions

### 1RM Calculation

```sql
CREATE OR REPLACE FUNCTION calculate_1rm(
  weight_kg numeric,
  reps integer,
  formula text DEFAULT 'epley'
) RETURNS numeric AS $$
BEGIN
  IF weight_kg IS NULL OR reps IS NULL OR reps <= 0 THEN
    RETURN NULL;
  END IF;

  CASE formula
    WHEN 'epley' THEN
      RETURN weight_kg * (1 + reps / 30.0);
    WHEN 'brzycki' THEN
      RETURN weight_kg * (36 / (37 - reps));
    WHEN 'lombardi' THEN
      RETURN weight_kg * POWER(reps, 0.10);
    WHEN 'oconner' THEN
      RETURN weight_kg * (1 + reps / 40.0);
    ELSE
      RETURN weight_kg * (1 + reps / 30.0); -- Default to Epley
  END CASE;
END;
$$ LANGUAGE plpgsql;
```

### Tonnage Calculation

```sql
CREATE OR REPLACE FUNCTION calculate_tonnage(
  weight_kg numeric,
  reps integer
) RETURNS numeric AS $$
BEGIN
  IF weight_kg IS NULL OR reps IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN weight_kg * COALESCE(reps, 0);
END;
$$ LANGUAGE plpgsql;
```

### Trigger for Set Calculations

```sql
CREATE OR REPLACE FUNCTION update_set_calculations()
RETURNS TRIGGER AS $$
BEGIN
  -- Update estimated 1RM
  NEW.est_1rm_kg := calculate_1rm(NEW.weight_kg, NEW.reps, 'epley');

  -- Update tonnage
  NEW.tonnage_kg := calculate_tonnage(NEW.weight_kg, NEW.reps);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_set_calculations
  BEFORE INSERT OR UPDATE ON exercise_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_set_calculations();
```

## Views

### User Personal Records

```sql
CREATE VIEW v_user_prs AS
SELECT
  es.user_id,
  m.id as movement_id,
  m.name as movement_name,
  m.category as movement_category,
  MAX(es.est_1rm_kg) as best_1rm_kg,
  MAX(es.weight_kg) as best_weight_kg,
  MAX(es.reps) as best_reps,
  COUNT(*) as total_sets,
  MAX(es.performed_at) as last_performed
FROM exercise_sets es
JOIN session_exercises se ON se.id = es.session_exercise_id
JOIN exercises e ON e.id = se.exercise_id
JOIN movements m ON m.id = e.movement_id
JOIN workout_sessions ws ON ws.id = se.session_id
WHERE es.weight_kg IS NOT NULL AND es.reps IS NOT NULL
GROUP BY es.user_id, m.id, m.name, m.category;
```

## Data Validation

### Check Constraints

```sql
-- Ensure positive values where appropriate
ALTER TABLE exercise_sets ADD CONSTRAINT check_weight_positive
  CHECK (weight_kg IS NULL OR weight_kg > 0);

ALTER TABLE exercise_sets ADD CONSTRAINT check_reps_positive
  CHECK (reps IS NULL OR reps > 0);

ALTER TABLE exercise_sets ADD CONSTRAINT check_rpe_range
  CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10));

-- Ensure logical date relationships
ALTER TABLE lift_goals ADD CONSTRAINT check_due_date_future
  CHECK (due_date IS NULL OR due_date > CURRENT_DATE);
```

## Migration Strategy

### Initial Setup

1. Create enums and types
2. Create core tables (profiles, movements, exercises)
3. Create workout tracking tables
4. Create goal tracking tables
5. Add indexes for performance
6. Implement RLS policies
7. Add helper functions and triggers
8. Create views for common queries

### Future Extensions

- Challenge system tables
- Social features (comments, reactions)
- Achievement system
- Analytics and reporting tables
- Integration with external fitness APIs

## Performance Considerations

1. **Indexing**: Strategic indexes on frequently queried columns
2. **Partitioning**: Consider partitioning large tables by date
3. **Archiving**: Archive old workout data to separate tables
4. **Caching**: Use Supabase Edge Functions for complex calculations
5. **Connection Pooling**: Configure appropriate connection limits

## Backup and Recovery

1. **Automated Backups**: Supabase handles automated backups
2. **Point-in-Time Recovery**: Available for production databases
3. **Data Export**: Regular exports for disaster recovery
4. **Schema Versioning**: Track schema changes in migrations
