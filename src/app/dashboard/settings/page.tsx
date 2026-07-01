'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserRepository } from '@/repositories/UserRepository'
import { Camera, ShieldCheck, Crown, Users, Loader2 } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'
import { mapApiErrorToToast } from '@/lib/apiFeedback'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function avatarUrl(key?: string | null) {
  if (!key) return undefined
  if (key.startsWith('http')) return key
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media/${key}`
}

export default function SettingsPage() {
  const { user, loading, refreshUser } = useAuth()
  const { toast } = useToast()
  const fileInput = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState('')
  const [fitnessLevel, setFitnessLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER')
  const [goals, setGoals] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '')
      setFitnessLevel(user.fitness_level || 'BEGINNER')
      setGoals((user.goals || []).join(', '))
    }
  }, [user])

  const tierLabel = user?.role === 'ADMIN' ? 'Admin' : user?.membership_tier === 'PAID' ? 'Paid' : 'Free'
  const TierIcon = user?.role === 'ADMIN' ? ShieldCheck : user?.membership_tier === 'PAID' ? Crown : Users

  const handleAvatarClick = () => fileInput.current?.click()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await UserRepository.uploadAvatar(file)
      await refreshUser()
      toast({ title: 'Avatar uploaded', variant: "success" })
    } catch (err) {
      toast(mapApiErrorToToast(err, { action: 'upload your avatar' }))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await UserRepository.updateProfile({
        display_name: displayName,
        fitness_level: fitnessLevel,
        goals: goals
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean),
      })
      await refreshUser()
      toast({ title: 'Profile updated', variant: "success" })
    } catch (err) {
      toast(mapApiErrorToToast(err, { action: 'update your profile' }))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff5d4f]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500">Manage your profile, avatar, and account.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploading}
            className="relative w-24 h-24 rounded-full overflow-hidden group border-4 border-white shadow-lg disabled:opacity-60"
          >
            {user?.avatar_url ? (
              <img src={avatarUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#ff5d4f] to-[#ff8a80] flex items-center justify-center text-white text-2xl font-bold">
                {initials(user?.display_name || 'GF')}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
            </div>
          </button>
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div>
            <h2 className="font-bold text-lg">{user?.display_name || 'Athlete'}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full w-fit">
              <TierIcon className="w-3.5 h-3.5" />
              {tierLabel}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5d4f]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Fitness level</label>
            <select
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5d4f]/30"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1.5">Goals</label>
            <input
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Build strength, Lose weight"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5d4f]/30"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#ff5d4f] text-white rounded-xl font-bold hover:bg-[#e54d3f] disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
