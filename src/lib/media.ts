let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
if (API_URL && !API_URL.startsWith('http') && !API_URL.startsWith('/')) {
  API_URL = `https://${API_URL}`
}

/**
 * Resolves a stored media key (e.g. "avatars/<id>.jpg") or an already-absolute
 * URL to something an <img> can load.
 */
export function mediaUrl(keyOrUrl?: string | null): string | null {
  if (!keyOrUrl) return null
  if (keyOrUrl.startsWith('http') || keyOrUrl.startsWith('blob:') || keyOrUrl.startsWith('data:')) {
    return keyOrUrl
  }
  return `${API_URL}/api/media/${keyOrUrl}`
}
