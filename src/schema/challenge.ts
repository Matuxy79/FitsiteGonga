import { z } from 'zod'

const challengeSchemaBase = z.object({
  name: z.string().min(1, 'Challenge name is required').max(100, 'Challenge name too long'),
  description: z.string().optional(),
  category: z.enum(['strength', 'cardio', 'nutrition', 'custom']),
  type: z.enum(['duration', 'repetition', 'distance', 'custom']),
  goal_value: z.number().positive('Goal value must be positive'),
  goal_unit: z.string().min(1, 'Goal unit is required'),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date'),
})

export const createChallengeSchema = challengeSchemaBase.refine((data) => {
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return endDate > startDate
}, {
  message: "End date must be after start date",
  path: ["end_date"]
})

export const updateChallengeSchema = challengeSchemaBase
  .partial()
  .refine((data) => {
    if (!data.start_date || !data.end_date) return true
    const startDate = new Date(data.start_date)
    const endDate = new Date(data.end_date)
    return endDate > startDate
  }, {
    message: "End date must be after start date",
    path: ["end_date"]
  })

export const joinChallengeSchema = z.object({
  challenge_id: z.string().uuid('Invalid challenge ID')
})

export const logProgressSchema = z.object({
  challenge_id: z.string().uuid('Invalid challenge ID'),
  value: z.number().positive('Progress value must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional(),
})

export type CreateChallengeDTO = z.infer<typeof createChallengeSchema>
export type UpdateChallengeDTO = z.infer<typeof updateChallengeSchema>
export type JoinChallengeDTO = z.infer<typeof joinChallengeSchema>
export type LogProgressDTO = z.infer<typeof logProgressSchema>
