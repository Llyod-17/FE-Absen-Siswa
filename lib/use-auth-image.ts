'use client'

import { useState, useEffect } from 'react'

/**
 * Fetches an image from an authenticated endpoint using the Bearer token
 * from localStorage and returns a blob object URL.
 * Automatically revokes old URLs to prevent memory leaks.
 */
export function useAuthImage(tokenId: number | null | undefined): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenId) {
      setBlobUrl(null)
      return
    }

    let cancelled = false

    const fetchImage = async () => {
      try {
        const headers: Record<string, string> = {}
        const authToken = localStorage.getItem('authToken')
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`

        const res = await fetch(`/api/v1/token/${tokenId}/image`, { headers })
        if (!res.ok) return

        const blob = await res.blob()
        if (!cancelled) {
          setBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return URL.createObjectURL(blob)
          })
        }
      } catch {
        // silently fail — no QR to show
      }
    }

    fetchImage()

    return () => {
      cancelled = true
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  }, [tokenId])

  return blobUrl
}
