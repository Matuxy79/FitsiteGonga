import type { Meta, StoryObj } from '@storybook/react'
import { LoginCard } from './LoginCard'

const meta: Meta<typeof LoginCard> = {
  title: 'Components/LoginCard',
  component: LoginCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onSuccess: () => console.log('Login successful'),
    onSwitchToSignup: () => console.log('Switch to signup'),
  },
}

export const Mobile: Story = {
  args: {
    onSuccess: () => console.log('Login successful'),
    onSwitchToSignup: () => console.log('Switch to signup'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}