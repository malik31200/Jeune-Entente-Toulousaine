'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  const closeMenu = () => {
    setMenuOpen(false)
    setMobileEquipesOpen(false)
  }

  return (
    <>
      <header style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="px-4 md:px-20">
          <div className="flex items-center justify-between h-24">

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
            <nav className="hidden lg:flex items-center gap-14">
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
              className="lg:hidden text-white p-2 ml-auto"
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
            >
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay sombre */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar mobile — slide depuis la gauche */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="fixed top-0 left-0 h-full z-50 flex flex-col"
            style={{ width: '75vw', maxWidth: '320px', backgroundColor: 'var(--color-primary)' }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
          >
            {/* En-tête sidebar */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
                <Image src="/logo.png" alt="Logo JET" width={36} height={36} className="rounded-full object-cover" />
                <span style={{ color: 'var(--color-accent)', fontFamily: 'GraffitiYouth', fontSize: '1.3rem' }}>La JET</span>
              </Link>
              <button onClick={closeMenu} className="text-white p-1" aria-label="Fermer">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Liens */}
            <div className="flex-1 overflow-y-auto py-4 px-5 flex flex-col gap-1">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-200 hover:text-white text-base font-medium py-3 border-b border-white/5"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}

              {/* Équipes accordion */}
              <button
                className="text-gray-200 hover:text-white text-base font-medium py-3 border-b border-white/5 flex items-center justify-between w-full"
                onClick={() => setMobileEquipesOpen(!mobileEquipesOpen)}
              >
                Équipes
                <svg
                  className={`w-4 h-4 transition-transform ${mobileEquipesOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {mobileEquipesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-3 flex flex-col gap-1"
                  >
                    {equipesDropdown.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm py-2.5 border-b border-white/5"
                        onClick={closeMenu}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-200 hover:text-white text-base font-medium py-3 border-b border-white/5"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}

              {shopUrl && (
                <a
                  href={shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-center text-sm font-bold px-4 py-3 rounded"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
                  onClick={closeMenu}
                >
                  🛒 Boutique
                </a>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
