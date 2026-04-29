'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'


const equipesDropdown = [
  { href: '/equipes', label: 'Foot à 11' },
  { href: '/equipes/foot-a-8', label: 'Foot à 8' },
  { href: '/equipes/foot-a-5', label: 'Foot à 5' },
  { href: '/equipes/futsal', label: 'Futsal' },
]

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/club', label: 'Club' },
  { href: '/horaires', label: 'Entraînements' },
  { href: '/detections', label: 'Détections' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/partenaires', label: 'Partenaires' },
  { href: '/contact', label: 'Contact' },
]

export default function Header({ shopUrl }: { shopUrl?: string | null }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [equipesOpen, setEquipesOpen] = useState(false)
  const [mobileEquipesOpen, setMobileEquipesOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openDropdown = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setEquipesOpen(true)
  }
  const closeDropdown = () => {
    timeoutRef.current = setTimeout(() => setEquipesOpen(false), 150)
  }

  return (
    <header style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full overflow-hidden"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            >
              <Image
                src="/logo.png"
                alt="Logo JET"
                width={40}
                height={40}
                className="object-cover rounded-full"
              />
            </motion.div>

            <div className="hidden sm:block">
              <motion.p
                className="leading-none"
                style={{ color: 'var(--color-accent)', fontFamily: 'GraffitiYouth', fontSize: '1.5rem' }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                La JET
              </motion.p>
              <motion.p
                className="text-gray-300 text-xs leading-none mt-0.5 tracking-widest uppercase"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.55 }}
              >
                Jeune Entente Toulousaine
              </motion.p>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200 group"
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              </Link>
            ))}

            {/* Dropdown Équipes */}
            <div
              className="relative"
              onMouseEnter={openDropdown}
              onMouseLeave={closeDropdown}
            >
              <span className="relative text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200 group cursor-pointer flex items-center gap-1">
                Équipes
                <svg className="w-3 h-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span
                  className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              </span>

              {equipesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-36 rounded-lg overflow-hidden shadow-xl z-50"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={openDropdown}
                  onMouseLeave={closeDropdown}
                >
                  {equipesDropdown.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      onClick={() => setEquipesOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.slice(3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200 group"
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              </Link>
            ))}

            {shopUrl && (
              <a
                href={shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold px-4 py-2 rounded transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
              >
                Boutique
              </a>
            )}
          </nav>

          {/* Hamburger mobile */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>

        {/* Nav mobile */}
        {menuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Équipes mobile */}
            <button
              className="text-gray-300 hover:text-white text-sm font-medium text-left flex items-center gap-1"
              onClick={() => setMobileEquipesOpen(!mobileEquipesOpen)}
            >
              Équipes
              <svg className={`w-3 h-3 transition-transform ${mobileEquipesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {mobileEquipesOpen && (
              <div className="pl-4 flex flex-col gap-2">
                {equipesDropdown.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm"
                    onClick={() => { setMenuOpen(false); setMobileEquipesOpen(false) }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {navLinks.slice(3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {shopUrl && (
              <a
                href={shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white text-sm font-medium"
              >
                Boutique
              </a>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
