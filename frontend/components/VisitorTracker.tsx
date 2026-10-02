'use client'

import { useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function VisitorTracker() {
  useEffect(() => {
    fetch(`${API_URL}/track-visit/`, { method: 'POST' }).catch(() => {})
  }, [])

  return null
}
