-- Create fitness-related tables for FitsiteGonga
-- Discord-themed fitness challenge platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'trainer', 'admin')) DEFAULT 'client',
  fitness_level TEXT NOT NULL CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'nutrition', 'custom')),
  type TEXT NOT NULL CHECK (type IN ('duration', 'repetition', 'distance', 'custom')),
  goal_value INTEGER NOT NULL,
  goal_unit TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT true,
  participants UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary')),
  category TEXT NOT NULL CHECK (category IN ('workout', 'consistency', 'milestone', 'social')),
  criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_date TIMESTAMPTZ DEFAULT NOW(),
  progress_value INTEGER,
  UNIQUE(user_id, achievement_id)
);

-- Create progress_logs table
CREATE TABLE public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  value INTEGER NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  photo_url TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create fitness_goals table
CREATE TABLE public.fitness_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'endurance', 'strength', 'custom')),
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_fitness_level ON public.users(fitness_level);

CREATE INDEX idx_challenges_category ON public.challenges(category);
CREATE INDEX idx_challenges_created_by ON public.challenges(created_by);
CREATE INDEX idx_challenges_active ON public.challenges(is_active);
CREATE INDEX idx_challenges_date_range ON public.challenges(start_date, end_date);
CREATE INDEX idx_challenges_participants ON public.challenges USING GIN(participants);

CREATE INDEX idx_achievements_category ON public.achievements(category);
CREATE INDEX idx_achievements_tier ON public.achievements(tier);

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

CREATE INDEX idx_progress_logs_user_id ON public.progress_logs(user_id);
CREATE INDEX idx_progress_logs_challenge_id ON public.progress_logs(challenge_id);
CREATE INDEX idx_progress_logs_logged_at ON public.progress_logs(logged_at);

CREATE INDEX idx_fitness_goals_user_id ON public.fitness_goals(user_id);
CREATE INDEX idx_fitness_goals_status ON public.fitness_goals(status);
CREATE INDEX idx_fitness_goals_deadline ON public.fitness_goals(deadline);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Trainers can view client profiles" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.users trainer 
      WHERE trainer.id = auth.uid() 
      AND trainer.role IN ('trainer', 'admin')
    )
  );

-- RLS Policies for challenges table
CREATE POLICY "Everyone can view active challenges" ON public.challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Trainers can create challenges" ON public.challenges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('trainer', 'admin')
    )
  );

CREATE POLICY "Challenge creators can update their challenges" ON public.challenges
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Challenge creators can delete their challenges" ON public.challenges
  FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for achievements table
CREATE POLICY "Everyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage achievements" ON public.achievements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for user_achievements table
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- RLS Policies for progress_logs table
CREATE POLICY "Users can view their own progress" ON public.progress_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.progress_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.progress_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON public.progress_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Trainers can view client progress" ON public.progress_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users trainer 
      WHERE trainer.id = auth.uid() 
      AND trainer.role IN ('trainer', 'admin')
    )
  );

-- RLS Policies for fitness_goals table
CREATE POLICY "Users can view their own goals" ON public.fitness_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals" ON public.fitness_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Trainers can view client goals" ON public.fitness_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users trainer 
      WHERE trainer.id = auth.uid() 
      AND trainer.role IN ('trainer', 'admin')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fitness_goals_updated_at BEFORE UPDATE ON public.fitness_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, tier, category, criteria) VALUES
-- Workout achievements
('First Steps', 'Complete your first workout', '👶', 'bronze', 'workout', '{"workout_count": 1}'),
('Getting Started', 'Complete 5 workouts', '🏃', 'bronze', 'workout', '{"workout_count": 5}'),
('Building Momentum', 'Complete 25 workouts', '💪', 'silver', 'workout', '{"workout_count": 25}'),
('Fitness Enthusiast', 'Complete 50 workouts', '🔥', 'gold', 'workout', '{"workout_count": 50}'),
('Gym Warrior', 'Complete 100 workouts', '⚔️', 'platinum', 'workout', '{"workout_count": 100}'),
('Fitness Legend', 'Complete 500 workouts', '👑', 'legendary', 'workout', '{"workout_count": 500}'),

-- Consistency achievements
('Streak Starter', 'Maintain a 3-day workout streak', '🔥', 'bronze', 'consistency', '{"streak_days": 3}'),
('Week Warrior', 'Maintain a 7-day workout streak', '⚡', 'silver', 'consistency', '{"streak_days": 7}'),
('Month Master', 'Maintain a 30-day workout streak', '🏆', 'gold', 'consistency', '{"streak_days": 30}'),
('Streak Legend', 'Maintain a 90-day workout streak', '👑', 'legendary', 'consistency', '{"streak_days": 90}'),

-- Milestone achievements
('Distance Runner', 'Run 10 miles total', '🏃‍♂️', 'bronze', 'milestone', '{"distance_miles": 10}'),
('Marathon Trainee', 'Run 50 miles total', '🏃‍♀️', 'silver', 'milestone', '{"distance_miles": 50}'),
('Century Club', 'Run 100 miles total', '🏅', 'gold', 'milestone', '{"distance_miles": 100}'),
('Iron Runner', 'Run 500 miles total', '🏆', 'platinum', 'milestone', '{"distance_miles": 500}'),

-- Social achievements
('Team Player', 'Complete your first group challenge', '🤝', 'bronze', 'social', '{"group_challenges": 1}'),
('Community Champion', 'Complete 10 group challenges', '🌟', 'silver', 'social', '{"group_challenges": 10}'),
('Motivator', 'Encourage 25 other users', '💬', 'gold', 'social', '{"encouragements": 25}'),
('Fitness Influencer', 'Help 100 users achieve their goals', '📢', 'platinum', 'social', '{"users_helped": 100}');

-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    achievement_record RECORD;
    user_stats RECORD;
BEGIN
    -- Get user statistics
    SELECT 
        COUNT(*) as workout_count,
        MAX(streak_days) as max_streak_days,
        COALESCE(SUM(CASE WHEN unit = 'miles' THEN value ELSE 0 END), 0) as total_miles,
        COUNT(DISTINCT challenge_id) as group_challenges
    INTO user_stats
    FROM public.progress_logs pl
    WHERE pl.user_id = user_uuid;

    -- Check each achievement
    FOR achievement_record IN 
        SELECT * FROM public.achievements 
        WHERE id NOT IN (
            SELECT achievement_id FROM public.user_achievements WHERE user_id = user_uuid
        )
    LOOP
        -- Check workout count achievements
        IF achievement_record.criteria->>'workout_count' IS NOT NULL THEN
            IF user_stats.workout_count >= (achievement_record.criteria->>'workout_count')::INTEGER THEN
                INSERT INTO public.user_achievements (user_id, achievement_id, progress_value)
                VALUES (user_uuid, achievement_record.id, user_stats.workout_count);
            END IF;
        END IF;

        -- Check streak achievements (simplified - would need more complex logic for actual streaks)
        IF achievement_record.criteria->>'streak_days' IS NOT NULL THEN
            IF user_stats.max_streak_days >= (achievement_record.criteria->>'streak_days')::INTEGER THEN
                INSERT INTO public.user_achievements (user_id, achievement_id, progress_value)
                VALUES (user_uuid, achievement_record.id, user_stats.max_streak_days);
            END IF;
        END IF;

        -- Check distance achievements
        IF achievement_record.criteria->>'distance_miles' IS NOT NULL THEN
            IF user_stats.total_miles >= (achievement_record.criteria->>'distance_miles')::INTEGER THEN
                INSERT INTO public.user_achievements (user_id, achievement_id, progress_value)
                VALUES (user_uuid, achievement_record.id, user_stats.total_miles);
            END IF;
        END IF;

        -- Check group challenge achievements
        IF achievement_record.criteria->>'group_challenges' IS NOT NULL THEN
            IF user_stats.group_challenges >= (achievement_record.criteria->>'group_challenges')::INTEGER THEN
                INSERT INTO public.user_achievements (user_id, achievement_id, progress_value)
                VALUES (user_uuid, achievement_record.id, user_stats.group_challenges);
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check achievements when progress is logged
CREATE OR REPLACE FUNCTION trigger_achievement_check()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM check_and_award_achievements(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER progress_logs_achievement_check
    AFTER INSERT ON public.progress_logs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_achievement_check();
