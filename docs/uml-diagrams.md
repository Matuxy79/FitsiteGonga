# UML Diagrams - FitsiteGonga System Architecture

## Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    profiles {
        UUID id PK
        TEXT display_name
        TEXT bio
        DATE birthdate
        TEXT gender
        TEXT unit_system
        TEXT role
        JSONB training_prefs
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    movements {
        UUID id PK
        TEXT key UK
        TEXT name
        movement_category category
        TEXT[] primary_muscles
        TEXT[] secondary_muscles
        equipment_type default_equipment
        BOOLEAN is_bodyweight
        TIMESTAMPTZ created_at
    }

    exercises {
        UUID id PK
        UUID movement_id FK
        TEXT variation
        TEXT name
        TEXT media_url
    }

    workout_sessions {
        UUID id PK
        UUID user_id FK
        TIMESTAMPTZ started_at
        TIMESTAMPTZ ended_at
        TEXT title
        TEXT notes
    }

    session_exercises {
        UUID id PK
        UUID session_id FK
        UUID exercise_id FK
        INT order_index
    }

    exercise_sets {
        UUID id PK
        UUID session_exercise_id FK
        INT set_index
        NUMERIC weight_kg
        INT reps
        NUMERIC rpe
        TEXT tempo
        INT duration_sec
        NUMERIC distance_m
        NUMERIC est_1rm_kg
        NUMERIC tonnage_kg
        TEXT notes
        TIMESTAMPTZ performed_at
    }

    lift_goals {
        UUID id PK
        UUID user_id FK
        UUID movement_id FK
        NUMERIC target_1rm_kg
        NUMERIC target_weight_kg
        INT target_reps
        DATE due_date
        TIMESTAMPTZ created_at
    }

    fitness_metrics {
        UUID id PK
        UUID user_id FK
        NUMERIC weight_kg
        NUMERIC height_cm
        NUMERIC body_fat_percent
        INT resting_hr
        INT max_hr
        TIMESTAMPTZ updated_at
    }

    measurement_history {
        UUID id PK
        UUID user_id FK
        DATE measure_date
        NUMERIC weight_kg
        NUMERIC body_fat_percent
        NUMERIC waist_cm
        NUMERIC hips_cm
        NUMERIC chest_cm
        TEXT notes
        TIMESTAMPTZ created_at
    }

    v_user_prs {
        UUID user_id
        UUID movement_id
        TEXT movement_name
        NUMERIC best_1rm_kg
        TIMESTAMPTZ last_performed_at
    }

    profiles ||--o{ workout_sessions : "has"
    profiles ||--o{ lift_goals : "sets"
    profiles ||--o{ fitness_metrics : "has"
    profiles ||--o{ measurement_history : "records"

    movements ||--o{ exercises : "has_variations"
    movements ||--o{ lift_goals : "targeted_by"
    movements ||--o{ v_user_prs : "tracked_in"

    exercises ||--o{ session_exercises : "performed_in"

    workout_sessions ||--o{ session_exercises : "contains"

    session_exercises ||--o{ exercise_sets : "includes"
```

## Application Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Dashboard Page]
        B[Workouts Page]
        C[Metrics Page]
        D[Account Setup]
        E[Auth Components]
    end

    subgraph "Component Layer"
        F[SessionLogger]
        G[ExercisePicker]
        H[SetRow]
        I[PRCard]
        J[GoalProgress]
        K[VolumeChart]
    end

    subgraph "State Management"
        L[useWorkoutStore]
        M[useLiftsStore]
    end

    subgraph "API Layer"
        N[Workouts API]
        O[Movements API]
        P[Exercises API]
        Q[Sets API]
        R[Goals API]
        S[PRs API]
    end

    subgraph "Database Layer"
        T[Supabase PostgreSQL]
        U[Auth Service]
        V[RLS Policies]
    end

    A --> F
    A --> I
    A --> J
    B --> F
    B --> G
    B --> H
    C --> I
    C --> J
    C --> K

    F --> L
    G --> M
    H --> L
    I --> M
    J --> M
    K --> M

    L --> N
    L --> Q
    M --> O
    M --> P
    M --> R
    M --> S

    N --> T
    O --> T
    P --> T
    Q --> T
    R --> T
    S --> T

    T --> U
    T --> V
```

## User Flow Diagram

```mermaid
flowchart TD
    A[User Visits App] --> B{Authenticated?}
    B -->|No| C[Login/Signup]
    B -->|Yes| D{Profile Complete?}

    C --> E[Supabase Auth]
    E --> F[Email Verification]
    F --> D

    D -->|No| G[Account Setup Flow]
    D -->|Yes| H[Dashboard]

    G --> I[Step 1: Profile Info]
    I --> J[Step 2: Fitness Metrics]
    J --> K[Step 3: Training Preferences]
    K --> H

    H --> L{User Action}
    L -->|Start Workout| M[Workout Session]
    L -->|View Metrics| N[Progress Tracking]
    L -->|Set Goals| O[Goal Management]

    M --> P[Add Exercises]
    P --> Q[Log Sets]
    Q --> R[Calculate 1RM]
    R --> S[Update PRs]
    S --> H

    N --> T[View PRs]
    N --> U[View Goals Progress]
    N --> V[View Volume Charts]

    O --> W[Create Lift Goals]
    W --> X[Track Progress]
    X --> H
```

## Workout Logging Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant W as WorkoutStore
    participant API as API Layer
    participant DB as Database

    U->>W: Start Workout Session
    W->>API: POST /api/workouts
    API->>DB: Create workout_sessions record
    DB-->>API: Session created
    API-->>W: Session data
    W-->>U: Session active

    U->>W: Add Exercise
    W->>API: GET /api/exercises
    API->>DB: Query exercises table
    DB-->>API: Exercise list
    API-->>W: Exercise data
    W->>API: Create session_exercise
    API->>DB: Insert session_exercises
    DB-->>API: Exercise added
    API-->>W: Exercise added
    W-->>U: Exercise available

    U->>W: Log Set (weight, reps)
    W->>API: POST /api/sets
    API->>DB: Insert exercise_sets
    DB->>DB: Trigger: Calculate 1RM & Tonnage
    DB-->>API: Set created with calculations
    API-->>W: Set data
    W-->>U: Set logged, 1RM updated

    U->>W: End Workout
    W->>API: PUT /api/workouts/[id]
    API->>DB: Update workout_sessions
    DB-->>API: Session ended
    API-->>W: Session completed
    W-->>U: Workout complete
```

## Data Flow Diagram

```mermaid
flowchart LR
    subgraph "User Input"
        A[Weight/Reps/RPE]
        B[Goal Targets]
        C[Profile Data]
    end

    subgraph "Processing Layer"
        D[1RM Calculations]
        E[Progress Calculations]
        F[Data Validation]
    end

    subgraph "Storage Layer"
        G[exercise_sets]
        H[lift_goals]
        I[profiles]
    end

    subgraph "Output Layer"
        J[Personal Records]
        K[Progress Bars]
        L[Dashboard Metrics]
    end

    A --> F
    A --> D
    B --> F
    B --> E
    C --> F

    D --> G
    E --> H
    F --> I

    G --> J
    H --> K
    I --> L

    J --> L
    K --> L
```

## Component Hierarchy Diagram

```mermaid
graph TD
    A[App Layout] --> B[Auth Guard]
    A --> C[Sidebar]
    A --> D[Main Content]

    B --> E[Profile Completion Check]

    C --> F[Dashboard Nav]
    C --> G[Workouts Nav]
    C --> H[Metrics Nav]

    D --> I[Dashboard Page]
    D --> J[Workouts Page]
    D --> K[Metrics Page]
    D --> L[Account Setup Page]

    I --> M[PR Cards]
    I --> N[Goal Progress]
    I --> O[Recent Workouts]

    J --> P[SessionLogger]
    J --> Q[WorkoutHistory]

    P --> R[ExercisePicker]
    P --> S[ExerciseCard]
    S --> T[SetRow]

    K --> U[PRCard]
    K --> V[GoalProgress]
    K --> W[VolumeChart]

    L --> X[Profile Step]
    L --> Y[Metrics Step]
    L --> Z[Training Step]
```

## API Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Components]
        B[Zustand Stores]
    end

    subgraph "API Routes"
        C[/api/workouts]
        D[/api/movements]
        E[/api/exercises]
        F[/api/sets]
        G[/api/lift-goals]
        H[/api/prs]
    end

    subgraph "Business Logic"
        I[Authentication Check]
        J[Data Validation]
        K[RLS Policy Check]
        L[Database Operations]
    end

    subgraph "Database"
        M[PostgreSQL Tables]
        N[Views]
        O[Functions/Triggers]
    end

    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H

    B --> C
    B --> D
    B --> E
    B --> F
    B --> G
    B --> H

    C --> I
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I

    I --> J
    J --> K
    K --> L
    L --> M
    L --> N
    L --> O
```

## Security Architecture Diagram

```mermaid
graph TB
    subgraph "Client Security"
        A[JWT Token Storage]
        B[Route Protection]
        C[Input Validation]
    end

    subgraph "API Security"
        D[Authentication Middleware]
        E[Authorization Checks]
        F[Rate Limiting]
    end

    subgraph "Database Security"
        G[Row Level Security]
        H[User Isolation]
        I[Data Encryption]
    end

    subgraph "Supabase Security"
        J[Auth Service]
        K[RLS Policies]
        L[API Keys]
    end

    A --> D
    B --> D
    C --> D

    D --> E
    E --> F
    F --> G

    G --> H
    H --> I
    I --> J

    J --> K
    K --> L
```

---

_These diagrams provide a comprehensive visual representation of the FitsiteGonga system architecture, data flows, and component relationships._
