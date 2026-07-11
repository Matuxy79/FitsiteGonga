'use client'

import { useRouter } from 'next/navigation'
import { Crown, Check } from 'lucide-react'
import { Modal } from './Modal'

interface UpgradeCtaProps {
  open: boolean
  onClose: () => void
  featureName?: string
}

const PRO_PERKS = [
  'Access to the 👑 pro-lounge channel',
  'Create up to 3 of your own squads',
  'Join up to 10 squads',
  '10MB uploads, 6 attachments per message',
  'PRO flair next to your name',
]

export function UpgradeCta({ open, onClose, featureName }: UpgradeCtaProps) {
  const router = useRouter()

  return (
    <Modal open={open} onClose={onClose} title="Upgrade to PRO">
      <div className="text-center mb-4">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-status-warning to-[#EA580C]">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm font-semibold text-clean-text">
          {featureName ? `${featureName} is a PRO feature` : 'Unlock the full community'}
        </p>
      </div>
      <ul className="space-y-2 mb-5">
        {PRO_PERKS.map((perk) => (
          <li key={perk} className="flex items-center gap-2.5 text-sm text-clean-text">
            <Check className="w-4 h-4 shrink-0 text-status-success" />
            {perk}
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          onClose()
          router.push('/dashboard/settings#membership-plan')
        }}
        className="w-full py-3 bg-clean-accent hover:bg-clean-accent-hover text-white text-sm font-semibold rounded-xl transition-colors"
      >
        See plans
      </button>
    </Modal>
  )
}
