import apiClient from '@/lib/apiClient'

export interface BusinessProfile {
  name: string
  address?: string
  phone?: string
  email?: string
  hours?: string
  mapsEmbedUrl?: string
}

function extractPayload<T>(response: unknown): T {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return (response as { data: T }).data
  }

  return response as T
}

export const SiteRepository = {
  async getTheme(): Promise<{ theme: string }> {
    const response = await apiClient.get<{ data: { theme: string } }>('/api/site/theme')
    return extractPayload(response)
  },

  async getBusinessProfile(): Promise<BusinessProfile | null> {
    const response = await apiClient.get<{ data: BusinessProfile | null }>('/api/site/business-profile')
    return extractPayload(response)
  },
}
