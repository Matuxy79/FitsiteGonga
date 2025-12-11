import prisma from '../db/client';
import { User, Role, FitnessLevel } from '@prisma/client';

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
};


