'use client'

import { useEffect, useState, useCallback } from 'react'


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

function getMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://backend:8000')) return url.replace('http://backend:8000', 'http://localhost:8000')
  if (url.startsWith('/media/')) return `http://localhost:8000${url}`
  return url
}

export default function GaleriePage() {
  const [photos, setPhotos] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/gallery/`).then(r => r.json()).then(data => {
      setPhotos(Array.isArray(data) ? data : (data.results || []))
    }).catch(() => {})
  }, [])

  const close = () => setSelectedIndex(null)
  const prev = useCallback(() => {
    setSelectedIndex(i => i !== null ? (i - 1 + photos.length) % photos.length : null)
  }, [photos.length])
  const next = useCallback(() => {
    setSelectedIndex(i => i !== null ? (i + 1) % photos.length : null)
  }, [photos.length])

  useEffect(() => {
    if (selectedIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedIndex, prev, next])

  const selectedUrl = selectedIndex !== null ? getMediaUrl(photos[selectedIndex]?.image) : null

  return (
    <div className="container pt-12" style={{ paddingBottom: '5rem' }}>
      <h1 className="text-3xl font-black uppercase mb-2 mt-8" style={{ color: 'var(--color-primary)' }}>
        Galerie
      </h1>
      <div className="h-1 w-16 mb-10" style={{ backgroundColor: 'var(--color-accent)' }} />

      {photos.length === 0 ? (
        <p className="text-gray-400 italic">Aucune photo pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, index) => {
            const url = getMediaUrl(photo.image)
            if (!url) return null
            return (
              <button
                key={photo.id}
                onClick={() => setSelectedIndex(index)}
                className="group relative overflow-hidden rounded-lg focus:outline-none"
                style={{ aspectRatio: '1 / 1' }}
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(249,115,22,0.15)' }} />
              </button>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {selectedIndex !== null && selectedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.94)' }}
          onClick={close}
        >
          {/* Fermer */}
          <button
            className="absolute top-4 right-4 text-white text-4xl font-bold leading-none hover:opacity-70 z-10"
            onClick={close}
          >
            ×
          </button>

          {/* Flèche gauche */}
          <button
            className="absolute left-4 text-white hover:opacity-70 z-10 p-2"
            style={{ fontSize: '2.5rem', lineHeight: 1 }}
            onClick={e => { e.stopPropagation(); prev() }}
          >
            ‹
          </button>

          {/* Image */}
          <img
            src={selectedUrl}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              width: '85vw',
              height: '85vh',
              objectFit: 'contain',
              borderRadius: '0.5rem',
            }}
          />

          {/* Flèche droite */}
          <button
            className="absolute right-4 text-white hover:opacity-70 z-10 p-2"
            style={{ fontSize: '2.5rem', lineHeight: 1 }}
            onClick={e => { e.stopPropagation(); next() }}
          >
            ›
          </button>

          {/* Compteur */}
          <p className="absolute bottom-4 text-gray-400 text-sm">
            {selectedIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </div>
  )
}
