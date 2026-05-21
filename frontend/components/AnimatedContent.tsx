'use client'

import { useEffect, useRef } from 'react'

interface Props {
  html: string
  className?: string
}

export default function AnimatedContent({ html, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const elements = ref.current.querySelectorAll(
      'p, h2, h3, h4, ul, ol, li, blockquote, figure, table, div[style], img'
    )

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    )

    elements.forEach((el) => {
      const elem = el as HTMLElement
      elem.style.opacity = '0'
      elem.style.transform = 'translateY(22px)'
      elem.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
      observer.observe(elem)
    })

    return () => observer.disconnect()
  }, [html])

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
