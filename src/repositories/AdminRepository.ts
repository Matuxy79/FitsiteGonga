import apiClient from '@/lib/apiClient'

export type AdminRole = 'ADMIN' | 'TRAINER' | 'CLIENT'

export interface AdminUser {
  id: string
  email: string
  display_name: string
  role: AdminRole
  created_at: string
  updated_at: string
  last_active_at?: string | null
}

export interface AdminStats {
  totalUsers: number
  activeToday: number
  totalChallenges: number
  totalProgressLogs: number
  progressLogsToday: number
}

export type AdminActivityType = 'progress' | 'signup' | 'create' | 'admin' | string

export interface AdminActivity {
  id: string
  type: AdminActivityType
  message: string
  timestamp: string
}

function extractPayload<T>(response: any): T {
  return (response?.data || response) as T
}

export const AdminRepository = {
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<{ data: AdminStats }>('/api/admin/stats')
    return extractPayload<AdminStats>(response)
  },

  async getUsers(params: {
    search?: string
    role?: AdminRole | string
    take?: number
    skip?: number
  }): Promise<{ users: AdminUser[]; total: number; take: number; skip: number }> {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.role) query.set('role', params.role)
    if (typeof params.take === 'number') query.set('take', String(params.take))
    if (typeof params.skip === 'number') query.set('skip', String(params.skip))

    const suffix = query.toString() ? `?${query.toString()}` : ''
    const response = await apiClient.get<{ data: { users: AdminUser[]; total: number; take: number; skip: number } }>(
      `/api/admin/users${suffix}`
    )

    return extractPayload(response)
  },

  async getActivity(limit = 12): Promise<AdminActivity[]> {
    const query = new URLSearchParams({ limit: String(limit) })
    const response = await apiClient.get<{ data: AdminActivity[] }>(`/api/admin/activity?${query.toString()}`)
    return extractPayload(response)
  },

  async updateUserRole(userId: string, role: AdminRole): Promise<AdminUser> {
    const response = await apiClient.put<{ data: AdminUser }>(`/api/admin/users/${userId}/role`, { role })
    return extractPayload(response)
  },
}
