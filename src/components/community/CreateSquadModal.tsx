'use client'

import { useState } from 'react'
import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CommunityRepository } from '@/repositories/CommunityRepository'
import { useToast } from '@/hooks/useToast'
import { mapApiErrorToToast } from '@/lib/apiFeedback'
import { Modal } from './Modal'

interface CreateSquadModalProps {
  open: boolean
  onClose: () => void
  onCreated: (squadId: string) => void
  canCreate: boolean
  onUpgrade: () => void
}

const VISIBILITIES = [
  { value: 'PUBLIC', label: 'Public', hint: 'Anyone can find and join' },
  { value: 'INVITE_ONLY', label: 'Invite only', hint: 'Visible, but joining needs an invite' },
  { value: 'PRIVATE', label: 'Private', hint: 'Hidden — invite only' },
] as const

export function CreateSquadModal({ open, onClose, onCreated, canCreate, onUpgrade }: CreateSquadModalProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'INVITE_ONLY' | 'PRIVATE'>('PUBLIC')
  const [busy, setBusy] = useState(false)

  const create = async () => {
    if (!name.trim() || busy) return
    setBusy(true)
    try {
      const squad = await CommunityRepository.createSquad({
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
      })
      toast({ title: `Squad "${squad.name}" created! 👑`, variant: 'success' })
      setName('')
      setDescription('')
      onCreated(squad.id)
      onClose()
    } catch (error) {
      toast(mapApiErrorToToast(error, { action: 'create this squad' }))
    } finally {
      setBusy(false)
    }
  }

  if (!canCreate) {
    return (
      <Modal open={open} onClose={onClose} title="Create a squad">
        <div className="text-center py-4">
          <Crown className="mx-auto mb-3 h-10 w-10 text-status-warning" />
          <p className="text-sm text-clean-text mb-1 font-semibold">Squad creation is a PRO feature</p>
          <p className="text-xs text-clean-muted mb-4">
            Upgrade to create your own squads, invite friends, and run private group chats.
          </p>
          <button
            onClick={onUpgrade}
            className="rounded-xl bg-clean-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clean-accent-hover"
          >
            Upgrade to PRO
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Create a squad">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-clean-muted">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="e.g. Morning Grinders"
            className="w-full rounded-xl border border-clean-border bg-white px-3 py-2.5 text-sm text-clean-text placeholder:text-clean-muted transition-colors duration-150 focus:border-clean-accent/50 focus:outline-none focus:ring-2 focus:ring-clean-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-clean-muted">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="What's this squad about?"
            className="w-full resize-none rounded-xl border border-clean-border bg-white px-3 py-2.5 text-sm text-clean-text placeholder:text-clean-muted transition-colors duration-150 focus:border-clean-accent/50 focus:outline-none focus:ring-2 focus:ring-clean-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-clean-muted">Visibility</label>
          <div className="space-y-1.5">
            {VISIBILITIES.map((v) => (
              <button
                key={v.value}
                onClick={() => setVisibility(v.value)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors',
                  visibility === v.value
                    ? 'border-clean-accent/50 bg-clean-accent-soft'
                    : 'border-clean-border bg-white hover:bg-clean-hover',
                )}
              >
                <div>
                  <div className="text-sm font-semibold text-clean-text">{v.label}</div>
                  <div className="text-xs text-clean-muted">{v.hint}</div>
                </div>
                <div
                  className={cn(
                    'h-4 w-4 rounded-full border-2',
                    visibility === v.value ? 'border-clean-accent bg-clean-accent' : 'border-gray-300',
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <button
          disabled={!name.trim() || busy}
          onClick={create}
          className="w-full rounded-xl bg-clean-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clean-accent-hover disabled:opacity-40"
        >
          {busy ? 'Creating…' : 'Create squad'}
        </button>
      </div>
    </Modal>
  )
}
