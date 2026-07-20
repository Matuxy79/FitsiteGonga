import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/lib/apiClient'
import { SiteRepository, type BusinessProfile } from '@/repositories/SiteRepository'

vi.mock('@/lib/apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockedApiClient = vi.mocked(apiClient)

describe('SiteRepository', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the public business profile from the API envelope', async () => {
    const profile: BusinessProfile = {
      name: 'GongaFit',
      email: 'admin@gongafitness.com',
    }
    mockedApiClient.get.mockResolvedValue({ data: profile })

    await expect(SiteRepository.getBusinessProfile()).resolves.toEqual(profile)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/api/site/business-profile')
  })

  it('preserves a null profile from an unconfigured site', async () => {
    mockedApiClient.get.mockResolvedValue({ data: null })

    await expect(SiteRepository.getBusinessProfile()).resolves.toBeNull()
  })
})
