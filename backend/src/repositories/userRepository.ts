import prisma from '../db/client';
import { User, Role, FitnessLevel, MembershipTier, SubscriptionStatus } from '@prisma/client';

// User type without password_hash for safe returns
export type UserWithoutPassword = Omit<User, 'password_hash'>;

export interface CreateUserDTO {
  email: string;
  password_hash: string;
  display_name: string;
  role?: Role;
  fitness_level?: FitnessLevel;
  goals?: string[];
}

export interface UpdateUserDTO {
  display_name?: string;
  avatar_url?: string;
  fitness_level?: FitnessLevel;
  goals?: string[];
}

export const userRepository = {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    return prisma.user.findUnique({
      where: { email },
    }) as Promise<(User & { password_hash: string }) | null>;
  },

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserWithoutPassword | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        membership_tier: true,
        subscription_status: true,
        trial_ends_at: true,
        fitness_level: true,
        goals: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  /**
   * Create new user
   */
  async create(data: CreateUserDTO): Promise<UserWithoutPassword> {
    return prisma.user.create({
      data: {
        email: data.email,
        password_hash: data.password_hash,
        display_name: data.display_name,
        role: data.role || 'CLIENT',
        fitness_level: data.fitness_level || 'BEGINNER',
        goals: data.goals || [],
      },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        membership_tier: true,
        subscription_status: true,
        trial_ends_at: true,
        fitness_level: true,
        goals: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserDTO): Promise<UserWithoutPassword> {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        membership_tier: true,
        subscription_status: true,
        trial_ends_at: true,
        fitness_level: true,
        goals: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  /**
   * Update membership tier (admin only)
   */
  async updateMembership(id: string, membership_tier: MembershipTier, subscription_status?: SubscriptionStatus): Promise<UserWithoutPassword> {
    return prisma.user.update({
      where: { id },
      data: { membership_tier, subscription_status },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        membership_tier: true,
        subscription_status: true,
        trial_ends_at: true,
        fitness_level: true,
        goals: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  async updateAccessMode(
    id: string,
    data: { role: Role; membership_tier: MembershipTier }
  ): Promise<UserWithoutPassword> {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        membership_tier: true,
        subscription_status: true,
        trial_ends_at: true,
        fitness_level: true,
        goals: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  /**
   * Update role (self-service redeem-code grant, or admin tooling)
   */
  async updateRole(id: string, role: Role): Promise<UserWithoutPassword> {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        membership_tier: true,
        subscription_status: true,
        trial_ends_at: true,
        fitness_level: true,
        goals: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  /**
   * Delete user (soft delete - set is_active to false)
   */
  async delete(id: string): Promise<void> {
    // In production, you might want to soft delete
    await prisma.user.delete({
      where: { id },
    });
  },

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: passwordHash },
    });
  },
};


