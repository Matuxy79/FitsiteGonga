import apiClient from '@/lib/apiClient'

export interface Channel {
  id: string
  squad_id: string
  name: string
  description?: string
  channel_type: string
  created_by: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChannelMessage {
  id: string
  content: string
  sender_id: string
  channel_id: string
  media_urls: string[]
  parent_id?: string
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  sender: {
    id: string
    display_name: string
    avatar_url?: string
    role: string
  }
  reactions: Array<{ id: string; emoji: string; user_id: string }>
  _count: { replies: number }
}

export const ChannelRepository = {
  async listChannels(squadId: string): Promise<Channel[]> {
    const res = await apiClient.get<{ channels: Channel[] }>(`/api/messages/squads/${squadId}/channels`)
    return res.channels
  },

  async createChannel(squadId: string, data: { name: string; description?: string }): Promise<Channel> {
    const res = await apiClient.post<{ channel: Channel }>(`/api/messages/squads/${squadId}/channels`, data)
    return res.channel
  },

  async getMessages(channelId: string): Promise<{ channel: Channel; messages: ChannelMessage[] }> {
    const res = await apiClient.get<{ channel: Channel; messages: ChannelMessage[] }>(
      `/api/messages/channels/channel/${channelId}`
    )
    return res
  },

  async sendMessage(channelId: string, content: string): Promise<ChannelMessage> {
    const res = await apiClient.post<{ message: ChannelMessage }>(`/api/messages/channels/channel/${channelId}/messages`, {
      content,
    })
    return res.message
  },

  async addReaction(messageId: string, emoji: string): Promise<void> {
    await apiClient.post(`/api/messages/channels/channel/_/messages/${messageId}/reactions`, { emoji })
  },
}
